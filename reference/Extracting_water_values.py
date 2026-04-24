# -------------------------------------- #
#                Imports                 #
# -------------------------------------- #

import pandas as pd
from num2words import num2words
import shutil

# -------------------------------------- #
#                 Inputs                 #
# -------------------------------------- #

# Choose the stage
stage = 1
# Choose the system
system = "s1"

# -------------------------------------- #
#                Read files              #
# -------------------------------------- #

# Copy the cuts file from .xls to .csv
try:
    # Copy and rename the file
    shutil.copyfile(f'costme{system}.xls', f'costme{system}.csv')
    print(f"File costme{system}.xls copied and renamed to costme{system}.csv successfully!")
except FileNotFoundError:
    print(f"File costme{system}.xls not found!")
except Exception as e:
    print(f"An error occurred while copying the file: {e}")

# Load the cuts file from .csv
costme = pd.read_csv(f'costme{system}.csv', delimiter='\t')

# Remove whitespace from cells
costme = costme.applymap(lambda x: x.strip() if isinstance(x, str) else x)

# Load the file with reservoir levels in %
volfinvu = pd.read_csv(f'volfinvu.csv', skiprows=3)

# -------------------------------------- #
#             Process files              #
# -------------------------------------- #

# Remove extra spaces from the header
costme.columns = costme.columns.str.strip()
volfinvu.columns = volfinvu.columns.str.strip()

# Filter necessary columns
costme_filtered = costme[['Stage', 'Num. Cut', 'Scenario', 'RHS', 'Vol. Hydro']]

# Count the total number of reservoirs
num_reservoirs = sum(costme.columns.str.contains('Vol. Hydro'))

# Create an empty dictionary and list to store units and hydros
unit_dict = {}
hydro_list = []
# Get the units
for col in costme.columns:
    unit_dict[col] = costme[col].iloc[0]
    # Get the hydros
    if 'Vol. Hydro' in col:
        hydro_list.append(costme[col].iloc[1].strip())

# -------------------------------------- #
#             Write Output               #
# -------------------------------------- #

# Write to the .txt file
with open('output.txt', 'w') as f:
    f.write('# Section header\n')
    f.write('SHOP_WATER_VALUES\n')

    # Filter the stage and calculate the number of cuts
    filtered_costme = costme[costme['Stage'] == str(stage)]
    num_cuts = len(filtered_costme)

    # Write the number of cuts and reservoirs
    f.write('# <Number of cuts> <Number of reservoirs>\n')
    f.write(f'{num_cuts} {num_reservoirs}\n')

    # Iterate through the cuts of the stage
    for idx, row in filtered_costme.iterrows():
        f.write(f'# <Cut number>	<Future cost in {unit_dict.get("RHS").strip()}>\n')
        f.write(f"{row['Num. Cut']} {float(row['RHS'])}\n")
        f.write(f'# Water values for {num2words(num_reservoirs)} reservoirs in {unit_dict.get("Vol. Hydro").strip()}\n')

        # Iterate through the columns capturing the water values
        for col_name in costme.columns:
            if 'Vol. Hydro' in col_name:
                f.write(f'{float(row[col_name])} ')
        f.write(f'\n# Reservoir levels for {num2words(num_reservoirs)} reservoirs in %\n')
        
        # Iterate through the hydro list to get its reservoir level
        for hydro in hydro_list:
            filtered_volfinvu = volfinvu[(volfinvu['Stag'] == stage) & (volfinvu['Seq.'] == int(row['Scenario']))]
            f.write(f'{filtered_volfinvu[hydro].values[0]} ')
        f.write('\n')
