use super::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum UserMail {
    IncomingOffer(String),
    IncomingAnswer(String),
    IncomingICE(String),
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
