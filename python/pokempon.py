# Pokemon Battle Arena

# Input for Pokemon 1
name1 = input("Enter Pokemon 1 Name: ")
attack1 = int(input(f"Enter {name1}'s Attack Power: "))
hp1 = int(input(f"Enter {name1}'s HP: "))

print()

# Input for Pokemon 2
name2 = input("Enter Pokemon 2 Name: ")
attack2 = int(input(f"Enter {name2}'s Attack Power: "))
hp2 = int(input(f"Enter {name2}'s HP: "))

print("\n--- Battle Starts! ---\n")

# Decide who attacks first
if attack1 >= attack2:
    attacker_name = name1
    attacker_attack = attack1
    attacker_hp = hp1

    defender_name = name2
    defender_attack = attack2
    defender_hp = hp2
else:
    attacker_name = name2
    attacker_attack = attack2
    attacker_hp = hp2

    defender_name = name1
    defender_attack = attack1
    defender_hp = hp1

# Battle Loop
while attacker_hp > 0 and defender_hp > 0:
    # Attacker attacks
    defender_hp -= attacker_attack
    print(f"{attacker_name} attacks {defender_name} for {attacker_attack} damage.")
    print(f"{defender_name}'s HP = {max(defender_hp, 0)}\n")

    if defender_hp <= 0:
        print(f"🏆 {attacker_name} wins the battle!")
        break

    # Defender attacks back
    attacker_hp -= defender_attack
    print(f"{defender_name} attacks {attacker_name} for {defender_attack} damage.")
    print(f"{attacker_name}'s HP = {max(attacker_hp, 0)}\n")

    if attacker_hp <= 0:
        print(f"🏆 {defender_name} wins the battle!")
        break