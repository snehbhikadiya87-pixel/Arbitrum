import pandas as pd
import numpy as np

name = np.array(["sneh","vatsal","prit","namra","krish","sneha"])
marks = np.array([65,70,80,90,99,100])
division = np.array(["be iii","be iii","be iv","be iii","be iii","be ii"])
df = pd.DataFrame({"Name": name, "Marks": marks, "Class": division})
print(df)