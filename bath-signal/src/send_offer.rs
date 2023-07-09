use super::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ResSendOffer {
    pub error: Option<SendOfferError>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SendOffer {
    pub user: UserId,
    pub from: UserId,
    pub offer: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
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
        mailbox.push(req.from, UserMail {
            ty: UserMailType::IncomingOffer,
            data: req.offer,
        });
        Ok(())
    }
}
