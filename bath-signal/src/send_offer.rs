use super::*;

#[derive(Serialize, Deserialize)]
pub struct ResSendOffer {
    pub error: Option<SendOfferError>,
}

#[derive(Serialize, Deserialize)]
pub struct SendOffer {
    pub user: UserId,
    pub offer: String,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum SendOfferError {
    InvalidCallId,
}

impl CallState {
    pub fn send_offer(&mut self, req: SendOffer) -> Result<(), SendOfferError> {
        let mailbox = self
            .user_mail
            .get_mut(&req.user)
            .ok_or(SendOfferError::InvalidCallId)?;
        mailbox.push(UserMail::IncomingAnswer(req.offer));
        Ok(())
    }
}
