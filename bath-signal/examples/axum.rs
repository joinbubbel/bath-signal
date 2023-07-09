use axum::{
    extract::{Json, State},
    routing::post,
    Router,
};
use bath_signal::*;
use std::{
    net::SocketAddr,
    sync::{Arc, RwLock},
};

pub struct AppState {
    call: RwLock<CallState>,
}

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let state = Arc::new(AppState {
        call: RwLock::new(CallState::new()),
    });

    let app = Router::new()
        .route("/api/call/create_call", post(api_create_call))
        .route("/api/call/join_query", post(api_join_query))
        .route("/api/call/send_offer", post(api_send_offer))
        .route("/api/call/send_answer", post(api_send_answer))
        .route("/api/call/check_mailbox", post(api_check_mailbox))
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn api_create_call(State(state): State<Arc<AppState>>) -> Json<ResCreateCall> {
    let mut call_state = state.call.write().unwrap();

    let res = match call_state.create_call() {
        Ok(res) => ResCreateCall {
            error: None,
            res: Some(res),
        },
        Err(err) => ResCreateCall {
            error: Some(err),
            res: None,
        },
    };

    Json(res)
}

async fn api_join_query(
    State(state): State<Arc<AppState>>,
    Json(req): Json<JoinQuery>,
) -> Json<ResJoinQuery> {
    let mut call_state = state.call.write().unwrap();

    let res = match call_state.join_query(req) {
        Ok(res) => ResJoinQuery {
            error: None,
            res: Some(res),
        },
        Err(err) => ResJoinQuery {
            error: Some(err),
            res: None,
        },
    };

    Json(res)
}

async fn api_send_offer(
    State(state): State<Arc<AppState>>,
    Json(req): Json<SendOffer>,
) -> Json<ResSendOffer> {
    let mut call_state = state.call.write().unwrap();

    let res = match call_state.send_offer(req) {
        Ok(_) => ResSendOffer { error: None },
        Err(err) => ResSendOffer { error: Some(err) },
    };

    Json(res)
}

async fn api_send_answer(
    State(state): State<Arc<AppState>>,
    Json(req): Json<SendAnswer>,
) -> Json<ResSendAnswer> {
    let mut call_state = state.call.write().unwrap();

    let res = match call_state.send_answer(req) {
        Ok(_) => ResSendAnswer { error: None },
        Err(err) => ResSendAnswer { error: Some(err) },
    };

    Json(res)
}

async fn api_check_mailbox(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CheckMailbox>,
) -> Json<ResCheckMailbox> {
    let mut call_state = state.call.write().unwrap();

    let res = match call_state.check_mailbox(req) {
        Ok(res) => ResCheckMailbox {
            error: None,
            res: Some(res),
        },
        Err(err) => ResCheckMailbox {
            error: Some(err),
            res: None,
        },
    };

    Json(res)
}