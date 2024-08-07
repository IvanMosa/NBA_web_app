let dbConfig = {};

dbConfig.jwtSecretKey="AskscubQsI";
dbConfig.jwtExpirationWeb="45s";


dbConfig.bcrypt_salt="15";


dbConfig.link="http://localhost:4000/";


dbConfig.host= 'localhost';
dbConfig.user= 'NBA';
dbConfig.password= 'nba22';

dbConfig.database= '';

dbConfig.connectString = '(DESCRIPTION=(ADDRESS=(host=172.22.3.46)(protocol=TCP)(port=1521))(CONNECT_DATA=(SERVICE_NAME=ROUTE.kron.hr)))';

module.exports = dbConfig;