export const AUTOLOGIN = (lighthouse) => () => lighthouse.isAuthorized || lighthouse.autologin();
