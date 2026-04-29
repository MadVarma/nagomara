exports.isEmail = (email) => /.+@.+\..+/.test(email);
exports.isPassword = (pw) => typeof pw === 'string' && pw.length >= 6;
