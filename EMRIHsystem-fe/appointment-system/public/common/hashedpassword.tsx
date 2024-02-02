import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    return hashedPassword;
    // bcrypt.hash(password, saltRounds, function(err, hashedPassword) {
    //     if (err) {
    //       console.error('Error hashing password:', err);
    //     } else {
    //       console.log('Hashed Password:', hashedPassword);
    //       return hashedPassword;
    //       // Now, you can use the hashedPassword for storing or comparison
    //     }
    //   });
}

export async function isPasswordValid(password: string, hashedPassword: string) {
    const isPasswordValid = bcrypt.compareSync(password, hashedPassword);
    return isPasswordValid;
}