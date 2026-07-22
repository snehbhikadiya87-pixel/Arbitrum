def is_prime(n):
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    i = 3
    while i * i <= n:
        if n % i == 0:
            return False
        i += 2
    return True

try:
    num = int(input("Enter a number: "))
    print("Prime" if is_prime(num) else "Not prime")
except ValueError:
    print("Invalid input")
