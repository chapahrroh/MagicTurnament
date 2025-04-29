from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Table

# Configura la URL de la base de datos (reemplaza por la tuya)
DATABASE_URL = 'sqlite:///DB/tournament.db'

# Crear la conexión con la base de datos
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Deshabilitar las restricciones de claves foráneas en SQLite
session.execute(text('PRAGMA foreign_keys = OFF;'))

# Obtener los metadatos de la base de datos
metadata = MetaData()
metadata.reflect(bind=engine)

# Obtener las tablas de la base de datos
tables = metadata.tables

# Eliminar todos los datos de todas las tablas
for table_name, table in tables.items():
    session.execute(table.delete())

# Confirmar la transacción
session.commit()

# Restaurar las restricciones de claves foráneas
session.execute(text('PRAGMA foreign_keys = ON;'))

# Cerrar la sesión
session.close()

print("Todos los datos han sido eliminados de las tablas.")
