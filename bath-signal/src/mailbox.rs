use super::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserMail {
    pub ty: UserMailType,
    pub data: String,
    pub from: UserId,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum UserMailType {
    IncomingOffer,
    IncomingAnswer,
    IncomingICE,
}

#[derive(Default, Debug, Clone)]
pub struct Mailbox {
    queue: Vec<UserMail>,
}

impl Mailbox {
    pub fn push(&mut self, mail: UserMail) {
        self.queue.push(mail);
    }

    pub fn flush(&mut self) -> Vec<UserMail> {
        let queue = self.queue.clone();
        self.queue.clear();
        queue
    }
}
