use super::*;

#[derive(Serialize, Deserialize)]
pub struct ResSendICE {
    pub error: Option<SendICEError>,
}

#[derive(Serialize, Deserialize)]
pub struct SendICE {
    pub user: UserId,
    pub ice: String,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum SendICEError {
    InvalidCallId,
}

impl CallState {
    pub fn send_ice(&mut self, req: SendICE) -> Result<(), SendICEError> {
        let mailbox = self
            .user_mail
            .get_mut(&req.user)
            .ok_or(SendICEError::InvalidCallId)?;
        mailbox.push(UserMail {
            ty: UserMailType::IncomingICE,
            data: req.ice,
        });
        Ok(())
    }
}
