import CryptoJS from 'crypto-js';


export default class LoginUtils {

  static verifyPass(password: string): boolean {
    return password.length >= 6;
  }

  static hashPass(password: string): string {
    var hashedPass = String(CryptoJS.SHA256(password))
    console.log(hashedPass)
    return hashedPass
  }

  // static salthash(password: string): string {
  //   let salt = bcrypt.genSaltSync(10);
  //   let hashPass: string = bcrypt.hashSync(password, salt);
  //   return hashPass;
  // }

  // static verifyHash(password: string, hashPass: any): boolean {
  //   return bcrypt.compareSync(password, hashPass);
  // }
}
