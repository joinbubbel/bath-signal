use super::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ResJoinQuery {
    pub error: Option<JoinQueryError>,
    #[serde(flatten)]
    pub res: Option<JoinQueryOut>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct JoinQuery {
    pub call: CallId,
    pub user: UserId,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct JoinQueryOut {
    pub users: Vec<UserId>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum JoinQueryError {
    InvalidCallId,
}

impl CallState {
    pub fn join_query(&mut self, req: JoinQuery) -> Result<JoinQueryOut, JoinQueryError> {
        let call = self
            .calls
            .get_mut(req.call.0)
            .ok_or(JoinQueryError::InvalidCallId)?;
        let users = call.users.clone();
        call.users.push(req.user.clone());
        self.user_mail.insert(req.user, Mailbox::default());
        Ok(JoinQueryOut { users })
    }
}
