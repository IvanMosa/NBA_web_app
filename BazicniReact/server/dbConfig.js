let dbConfig = {};

dbConfig.jwtAccessSecretKey = 'AskscubQsI';
dbConfig.jwtAccessExpirationWeb = '15s';

dbConfig.jwtRefreshSecretKey = 'MnEksfUSZx';

dbConfig.bcrypt_salt = '15';

dbConfig.link = '/';

dbConfig.host = 'localhost';
dbConfig.user = 'NBA';
dbConfig.password = 'nba22';

dbConfig.database = '';

dbConfig.connectString =
    '(DESCRIPTION=(ADDRESS=(host=172.22.3.46)(protocol=TCP)(port=1521))(CONNECT_DATA=(SERVICE_NAME=ROUTE.kron.hr)))';

module.exports = dbConfig;
