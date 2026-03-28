
from sqlalchemy.orm import Session
from app.models.models import Helper, HelpSession,SessionStatus,DomainExpertise

def find_available_helper(domain:DomainExpertise,db:Session):
    ## first finding specialist helper with matching domain if available
    specialist=db.query(Helper).filter(
        Helper.domain_expertise==domain,
        ~Helper.help_sessions.any(
            HelpSession.status == SessionStatus.ACTIVE
        )
    ).first()
    
    if specialist:
        return specialist
    ## if no specialist helper is available then find general therapist helper
    general=db.query(Helper).filter(
        Helper.domain_expertise==DomainExpertise.GENERAL,
        ~Helper.help_sessions.any(
            HelpSession.status == SessionStatus.ACTIVE
        )
    ).first()
    
    if general:
        return general

    return None