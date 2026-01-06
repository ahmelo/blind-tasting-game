import bcrypt

# Hash da senha
def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")[:72]  # garante <=72 bytes
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode()  # armazenar como string

# Verificar senha
def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_bytes = plain_password.encode("utf-8")[:72]
    return bcrypt.checkpw(plain_bytes, hashed_password.encode())
