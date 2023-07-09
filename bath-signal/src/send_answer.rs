use super::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ResSendAnswer {
    pub error: Option<SendAnswerError>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SendAnswer {
    pub user: UserId,
    pub answer: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum SendAnswerError {
    InvalidUserId,
}

impl CallState {
    pub fn send_answer(&mut self, req: SendAnswer) -> Result<(), SendAnswerError> {
        let mailbox = self
            .user_mail
            .get_mut(&req.user)
            .ok_or(SendAnswerError::InvalidUserId)?;
        mailbox.push(UserMail {
            ty: UserMailType::IncomingAnswer,
            data: req.answer,
        });
        Ok(())
    }
}
