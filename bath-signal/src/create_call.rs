use super::*;

#[derive(Serialize, Deserialize)]
pub struct ResCreateCall {
    pub error: Option<CreateCallError>,
    #[serde(flatten)]
    pub res: Option<CreateCallOut>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateCallOut {
    pub call: CallId,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CreateCallError {}

impl CallState {
    pub fn create_call(&mut self) -> Result<CreateCallOut, CreateCallError> {
        let call = Call::new();
        self.calls.push(call);
        Ok(CreateCallOut {
            call: CallId(self.calls.len() - 1),
        })
    }
}
