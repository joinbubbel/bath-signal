use super::*;

#[derive(Serialize, Deserialize)]
pub struct ResSendAnswer {
    pub error: Option<SendAnswerError>,
}

#[derive(Serialize, Deserialize)]
pub struct SendAnswer {
    pub user: UserId,
    pub answer: String,
}

#[derive(Serialize, Deserialize)]
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
        mailbox.push(UserMail::IncomingAnswer(req.answer));
        Ok(())
    }
}
