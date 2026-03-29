
from sqlalchemy.orm import Session
from sqlalchemy import exists
from app.models.models import Helper, HelpSession, SessionStatus, DomainExpertise


def _busy_helper_ids(db: Session):
    """Return the set of helper_ids that currently have an ACTIVE session."""
    rows = (
        db.query(HelpSession.helper_id)
        .filter(HelpSession.status == SessionStatus.ACTIVE, HelpSession.helper_id.isnot(None))
        .all()
    )
    return {r[0] for r in rows}


def find_available_helper(domain: DomainExpertise, db: Session):
    busy = _busy_helper_ids(db)

    # 1. Try specialist with matching domain
    specialist = (
        db.query(Helper)
        .filter(
            Helper.domain_expertise == domain,
            Helper.helper_id.notin_(busy) if busy else True,
        )
        .first()
    )
    if specialist:
        return specialist

    # 2. Fall back to any GENERAL helper
    general = (
        db.query(Helper)
        .filter(
            Helper.domain_expertise == DomainExpertise.GENERAL,
            Helper.helper_id.notin_(busy) if busy else True,
        )
        .first()
    )
    if general:
        return general

    # 3. Fall back to any available helper regardless of domain
    any_helper = (
        db.query(Helper)
        .filter(Helper.helper_id.notin_(busy) if busy else True)
        .first()
    )
    return any_helper