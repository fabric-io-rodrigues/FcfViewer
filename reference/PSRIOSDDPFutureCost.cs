using System;
using System.IO;
using System.Linq;

namespace DataManager
{
    public class PSRIOSDDPFutureCost
    {
        private string filename;
        private FileStream inFile;
        private int[] iprev;
        public int[] numdam;
        private int[] numhid;
        public double[] dam_vol;
        private double[][] hyd_inflow;
        private int[] number_constraints;
        private int[] last_registry_stage;
        private int current_registry;
        private int nrecut;
        private int ircut;
        private int verr4;
        private int ndam;
        private int nplant;
        private int nseq;
        private int norden;
        private int mesini;
        public int anoini;
        public int nper;
        private double zinf0;
        public int iter;
        private double zinf;
        private double zsup;
        public int itbst;
        public double zsupbst;
        public int current_stage;
        public int cluster;
        public int simulation;
        public double rhs;
        private BinaryReader reader;

        public PSRIOSDDPFutureCost()
        {
            
        }

        //
        public string[] GetGroupsAgents()
        {
            return groupsAgents;
        }
        public string[] GetAgents(int group = 0)
        {
            return vec_agentes[group];
        }
        //
        private string[] groupsAgents;
        private string[][] vec_agentes;
        private void InitAgents()
        {
            groupsAgents = new string[norden + 1];
            vec_agentes = new string[norden + 1][];

            groupsAgents[0] = "Vol. Hydro";
            
            vec_agentes[0] = new string[this.numdam.Length];
            for (int i = 0; i < this.numdam.Length; i++)
            {
                vec_agentes[0][i] = string.Format("cod. {0}", this.numdam[i]);
            }
            
            for (int iord = 0; iord < norden; iord++)
            {
                groupsAgents[iord + 1] = string.Format("Inflow ( {0})", iord * -1);
                vec_agentes[iord + 1] = new string[this.numhid.Length];
                for (int iplant = 0; iplant < nplant; iplant++)
                {
                    vec_agentes[iord + 1][iplant] = string.Format("cod. {0}", this.numhid[iplant]);
                }
            }
        }

        private double[][] values;
        private void InitValues()
        {
            values = new double[groupsAgents.Length][];
            for (int iord = 0; iord < norden; iord++)
                values[iord + 1] = new double[nplant];
        }

        private void PopulateValues()
        {
            values[0] = dam_vol;
            for (int iord = 0; iord < norden; iord++)
                for (int iplant = 0; iplant < nplant; iplant++)
                    values[iord + 1][iplant] = hyd_inflow[iplant][iord];
        }

        public double Value(int agent, int group = 0)
        {
            return values[group][agent];
        }

        public int Load(string filename)
        {
            this.filename = filename;
            inFile = new FileStream(filename, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);

            if (!inFile.CanRead)
                return 1;

            reader = new BinaryReader(inFile);

            nrecut = reader.ReadInt32();
            ircut = reader.ReadInt32();
            verr4 = reader.ReadInt32();
            ndam = reader.ReadInt32();
            nplant = reader.ReadInt32();
            nseq = reader.ReadInt32();
            norden = reader.ReadInt32();
            mesini = reader.ReadInt32();
            anoini = reader.ReadInt32();
            nper = reader.ReadInt32();
            zinf0 = reader.ReadDouble();
            iter = reader.ReadInt32();
            zinf = reader.ReadDouble();
            zsup = reader.ReadDouble();
            itbst = reader.ReadInt32();
            zsupbst = reader.ReadDouble();

            iprev = new int[nper];
            for (int iper = 0; iper < nper; iper++)
            {
                iprev[iper] = reader.ReadInt32();
            }

            inFile.Seek(nrecut, SeekOrigin.Begin);

            numdam = new int[ndam];
            for (int idam = 0; idam < ndam; idam++)
            {
                numdam[idam] = reader.ReadInt32();
            }

            numhid = new int[nplant];
            for (int iplt = 0; iplt < nplant; iplt++)
            {
                numhid[iplt] = reader.ReadInt32();
            }

            dam_vol = new double[ndam];
            hyd_inflow = new double[nplant][];
            for (int iplt = 0; iplt < nplant; iplt++)
            {
                hyd_inflow[iplt] = new double[norden];
            }

            current_registry = 2;
            number_constraints = new int[nper];
            last_registry_stage = new int[nper];
            for (int istage = 0; istage < nper; istage++)
            {
                number_constraints[istage] = -1;
            }
            number_constraints[nper - 1] = 0;
            last_registry_stage[nper - 1] = 0;

            InitAgents();
            InitValues();

            return 1;
        }

        public void CloseOutput()
        {
            if (inFile != null)
                inFile.Close();
        }

        public int NumberCuts()
        {
            if (current_stage == -1)
                return 0;
            return NumberCutsOfStage(current_stage + 1);
        }

        public int NumberCutsOfStage(int stage)
        {
            int oStage = stage - 1;
            if (number_constraints[oStage] == -1)
            {
                int iaux = iprev[oStage];
                int total = 0;
                last_registry_stage[oStage] = iaux;
                while (iaux > 0)
                {
                    if (iaux > current_registry)
                        current_registry = iaux;
                    last_registry_stage[oStage] = iaux;

                    total++;
                    long position = nrecut * ((long)iaux - 1);
                    inFile.Seek(position, SeekOrigin.Begin);
                    iaux = reader.ReadInt32();
                }
                number_constraints[oStage] = total;
                RestartStage();
            }

            return number_constraints[oStage];
        }

        public void GotoStage(int stage)
        {
            current_stage = stage - 1;
            RestartStage();
        }

        public void RestartStage()
        {
            int ireg = iprev[current_stage];
            if (ireg > 0)
            {
                long pos = (nrecut * ((long)ireg - 1));
                inFile.Seek(pos, SeekOrigin.Begin);
            }
            else
            {
                current_stage = -1;
            }
        }

        public void GetCut()
        {
            int ireg, it0;

            if (current_stage == -1)
                return;

            ireg = reader.ReadInt32();
            iter = reader.ReadInt32();
            cluster = reader.ReadInt32();
            simulation = reader.ReadInt32();
            it0 = reader.ReadInt32();
            rhs = reader.ReadDouble();

            for (int idam = 0; idam < ndam; idam++)
            {
                dam_vol[idam] = reader.ReadDouble();
            }

            for (int iord = 0; iord < norden; iord++)
            {
                for (int iplant = 0; iplant < nplant; iplant++)
                {
                    hyd_inflow[iplant][iord] = reader.ReadDouble();
                }
            }

            if (ireg > 0)
            {
                inFile.Seek(nrecut * ((long)ireg - 1), SeekOrigin.Begin);
            }

            PopulateValues();
        }

    }
}
