import numpy as np
arr = np.array([["sneh",65],["vatsal",70],["prit",80],["namra",90],["krish",99],["sneha",100]])
top_students = max( arr, key=lambda x: int(x[1]))
print(top_students)
last_student = min(arr, key=lambda x: int(x[1]))
print(last_student)
avg_marks = np.mean(arr[:,1].astype(int))
print(avg_marks)