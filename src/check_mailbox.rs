use super::*;

#[derive(Serialize, Deserialize)]
pub struct ResCheckMailbox {
    pub error: Option<CheckMailboxError>,
    #[serde(flatten)]
    pub res: Option<CheckMailboxOut>,
}

#[derive(Serialize, Deserialize)]
pub struct CheckMailbox {
    pub user: UserId,
}

#[derive(Serialize, Deserialize)]
pub struct CheckMailboxOut {
    pub messages: Vec<UserMail>,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CheckMailboxError {
    InvalidUserId,
}

impl CallState {
    pub fn check_mailbox(
        &mut self,
        req: CheckMailbox,
    ) -> Result<CheckMailboxOut, CheckMailboxError> {
        let mailbox = self
            .user_mail
            .get_mut(&req.user)
            .ok_or(CheckMailboxError::InvalidUserId)?;
        let messages = mailbox.flush();
        Ok(CheckMailboxOut { messages })
    }
}
