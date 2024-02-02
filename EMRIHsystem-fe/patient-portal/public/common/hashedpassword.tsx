import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    return hashedPassword;
}

export async function isPasswordValid(password: string, hashedPassword: string) {
    const isPasswordValid = bcrypt.compareSync(password, hashedPassword);
    return isPasswordValid;
}