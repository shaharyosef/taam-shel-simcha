from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.models import Comment, Recipe, User
from app.schemas.comment_schema import CommentCreate, CommentResponse
from app.services import users_services

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("/{recipe_id}", response_model=CommentResponse)
def add_comment(recipe_id: int, comment: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(users_services.get_current_user)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    new_comment = Comment(
        content=comment.content,
        user_id=current_user.id,
        recipe_id=recipe_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return CommentResponse(
        id=new_comment.id,
        content=new_comment.content,
        created_at=new_comment.created_at,
        user_id=new_comment.user_id,
        recipe_id=new_comment.recipe_id,
        username=current_user.username
    )

@router.get("/{recipe_id}", response_model=list[CommentResponse])
def get_comments(recipe_id: int, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.recipe_id == recipe_id)
        .order_by(Comment.created_at.desc())
        .all()
    )
    return [
        CommentResponse(
            id=c.id,
            content=c.content,
            created_at=c.created_at,
            user_id=c.user_id,
            recipe_id=c.recipe_id,
            username=c.user.username if c.user else "Unknown"
        )
        for c in comments
    ]


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(users_services.get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if not (current_user.is_admin or current_user.id == comment.user_id):
        raise HTTPException(status_code=403, detail="You are not authorized to delete this comment")
    
    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted successfully"}