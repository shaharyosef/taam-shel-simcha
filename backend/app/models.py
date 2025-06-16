from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base
from uuid import uuid4


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_admin = Column(Boolean, default=False)
    profile_image_url = Column(String, nullable=True)
    wants_emails = Column(Boolean, default=True)


    recipes = relationship("Recipe", back_populates="creator", cascade="all, delete")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete")
    ratings = relationship("Rating", back_populates="user")
    comments = relationship("Comment", back_populates="user")



class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    ingredients = Column(Text)  # JSON (כטקסט) – לדוגמה: [{"name": "בצל", "amount": "1"}]
    instructions = Column(Text)
    image_url = Column(String)
    video_url = Column(String)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    share_token = Column(String, unique=True, nullable=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    creator = relationship("User", back_populates="recipes")

    favorited_by = relationship("Favorite", back_populates="recipe")
    ratings = relationship("Rating", back_populates="recipe")
    comments = relationship("Comment", back_populates="recipe")



class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    recipe = relationship("Recipe", back_populates="favorited_by")


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # מ-1 עד 5
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "recipe_id", name="unique_user_recipe_rating"),
    )

    user = relationship("User", back_populates="ratings")
    recipe = relationship("Recipe", back_populates="ratings")



class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    recipe_id = Column(Integer, ForeignKey("recipes.id"))

    user = relationship("User", back_populates="comments")
    recipe = relationship("Recipe", back_populates="comments")

