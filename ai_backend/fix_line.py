with open("server.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(len(lines)):
    if "Voice Input Received" in lines[i]:
        lines[i] = '    print(f"\\n[Voice Input Received]: {req.message}")\n'

with open("server.py", "w", encoding="utf-8") as f:
    f.writelines(lines)
