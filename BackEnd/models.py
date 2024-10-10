#TODO Agregar métodos para terminar un torneo y guardar los resultados

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Sequence, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship

from config import DB_PATH
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, DB_PATH)}"


#engine = create_engine(f'sqlite:///{DB_PATH}')
engine = create_engine(DATABASE_URL)
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
    tournament_scores = relationship("TournamentScores", primaryjoin="Players.id == TournamentScores.player_id")  #

    def __repr__(self):
        return f"Players(name={self.name}, creationDate={self.creationDate}, personalScore={self.personalScore}, tournament={self.tournament})"


class Tournament(Base):
    __tablename__ = 'tournament'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    type = Column(String)
    creationDate = Column(DateTime)
    status = Column(Boolean, default=False)
    players = relationship("Players", secondary=tournamentsPlayers, back_populates="tournament")
    scores = relationship("TournamentScores", back_populates="tournament")
    matches = relationship("Matches", back_populates="tournament")

class TournamentScores(Base):
    __tablename__ ='tournamentScores'
    id = Column(Integer, primary_key=True, autoincrement=True)
    tournament_id= Column(Integer, ForeignKey('tournament.id'))
    player_id = Column(Integer, ForeignKey('players.id'))
    tournament = relationship("Tournament", back_populates="scores")
    player = relationship("Players", back_populates="tournament_scores")
    score = Column(Integer, default=0)


class Matches(Base):
    __tablename__ ='matches'
    id = Column(Integer, primary_key=True, autoincrement=True)
    tournament_id = Column(Integer, ForeignKey('tournament.id'))
    player1_id = Column(Integer, ForeignKey('players.id'))
    player2_id = Column(Integer, ForeignKey('players.id'))
    tournament = relationship("Tournament", back_populates="matches")
    player1 = relationship("Players", foreign_keys=[player1_id])
    player2 = relationship("Players", foreign_keys=[player2_id])
    win = Column(Integer, default=-1)
    status = Column(Boolean, default=False)
    draw = Column(Boolean, default=False)



Base.metadata.create_all(engine)

session = sessionmaker(bind=engine)()
