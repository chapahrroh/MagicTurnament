from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Sequence, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship

from config import DB_PATH


engine = create_engine(f'sqlite:///{DB_PATH}')
Base = declarative_base()

# association tables
tournamentsPlayers = Table('tournamentsPlayers', Base.metadata,
    Column('tournament_id', Integer, ForeignKey('tournament.id')),
    Column('player_id', Integer, ForeignKey('players.id'))
)

class Players(Base):
    __tablename__ = 'players'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    creationDate = Column(DateTime)
    personalScore = Column(Integer, default=0)
    tournament = relationship("Tournament",secondary=tournamentsPlayers, back_populates="players")

    def __repr__(self):
        return f"Players(name={self.name}, creationDate={self.creationDate}, personalScore={self.personalScore}, tournament={self.tournament})"


class Tournament(Base):
    __tablename__ = 'tournament'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    creationDate = Column(DateTime)
    players = relationship("Players", secondary=tournamentsPlayers, back_populates="tournament")


class Matches(Base):
    __tablename__ ='matches'
    id = Column(Integer, primary_key=True, autoincrement=True)


Base.metadata.create_all(engine)

session = sessionmaker(bind=engine)()