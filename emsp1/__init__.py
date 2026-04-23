try:
    import pymysql

    pymysql.install_as_MySQLdb()
except ImportError:
    # PyMySQL is optional until the MySQL dependency is installed locally.
    pass
