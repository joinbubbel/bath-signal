use super::*;
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserMail {
    pub ty: UserMailType,
    pub data: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum UserMailType {
    IncomingOffer,
    IncomingAnswer,
    IncomingICE,
}

#[derive(Default, Debug, Clone)]
pub struct Mailbox {
    queues: HashMap<UserId, Vec<UserMail>>,
}

impl Mailbox {
    pub fn push(&mut self, user: UserId, mail: UserMail) {
        self.queues.entry(user).or_insert(vec![]).push(mail);
    }

    pub fn flush(&mut self, user: UserId) -> Vec<UserMail> {
        let queue = self.queues.entry(user).or_insert(vec![]);
        let res_queue = queue.clone();
        queue.clear();
        res_queue
    }
}
