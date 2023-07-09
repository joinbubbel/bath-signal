use mailbox::{Mailbox, UserMail};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

mod check_mailbox;
mod create_call;
mod join_query;
mod leave;
mod mailbox;
mod send_answer;
mod send_offer;

pub use check_mailbox::{CheckMailbox, CheckMailboxError, CheckMailboxOut, ResCheckMailbox};
pub use create_call::{CreateCallError, CreateCallOut, ResCreateCall};
pub use join_query::{JoinQuery, JoinQueryError, JoinQueryOut, ResJoinQuery};
pub use leave::{Leave, LeaveError};
pub use send_answer::{ResSendAnswer, SendAnswer, SendAnswerError};
pub use send_offer::{ResSendOffer, SendOffer, SendOfferError};

#[derive(Serialize, Deserialize, Debug, Clone, Hash, PartialEq, Eq)]
pub struct UserId(pub String);
#[derive(Serialize, Deserialize, Debug, Clone, Hash, PartialEq, Eq)]
pub struct CallId(usize);

#[derive(Debug, Default, Clone)]
pub struct CallState {
    pub(crate) calls: Vec<Call>,
    pub(crate) user_mail: HashMap<UserId, Mailbox>,
}

impl CallState {
    pub fn new() -> Self {
        Self::default()
    }
}

#[derive(Debug, Clone)]
struct Call {
    pub(crate) users: Vec<UserId>,
}

impl Call {
    pub fn new() -> Self {
        Self { users: vec![] }
    }
}
