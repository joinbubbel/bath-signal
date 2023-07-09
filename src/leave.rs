use super::*;

#[derive(Serialize, Deserialize)]
pub struct ResLeave {
    pub error: Option<LeaveError>,
}

#[derive(Serialize, Deserialize)]
pub struct Leave {
    pub user: UserId,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum LeaveError {}

impl CallState {
    pub fn leave(&mut self, _: Leave) -> Result<(), LeaveError> {
        todo!()
    }
}
