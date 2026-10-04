import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from storage.database import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mode = Column(String, nullable=False)        # 'pvp' or 'pvc'
    level = Column(String, nullable=False)        # 'easy' / 'medium' / 'hard'
    winner = Column(String, nullable=False)       # 's' or 'w'
    seconds = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    players = relationship("GamePlayer", back_populates="game",
                           cascade="all, delete-orphan")
    moves = relationship("Move", back_populates="game",
                         cascade="all, delete-orphan")


class GamePlayer(Base):
    __tablename__ = "game_players"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=True)   # filled in once accounts exist
    role = Column(String, nullable=False)                 # 'wolf' or 'sheep'
    result = Column(String, nullable=False)               # 'win' or 'loss'

    game = relationship("Game", back_populates="players")


class Move(Base):
    __tablename__ = "moves"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False)
    move_number = Column(Integer, nullable=False)
    from_pos = Column(String, nullable=False)   # e.g. "7,0"
    to_pos = Column(String, nullable=False)     # e.g. "6,1"

    game = relationship("Game", back_populates="moves")