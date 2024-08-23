from sqlalchemy import Column, Integer, String, DateTime, Sequence
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base


engine = create_engine('sqlite:///tournament.db')
Base = declarative_base()

class Jugadores(Base):
    __tablename__ = 'jugadores'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String)
    fechaCreacion = Column(DateTime)
    puntuacionGeneral = Column(Integer, default=0)

Base.metadata.create_all(engine)

session = sessionmaker(bind=engine)
