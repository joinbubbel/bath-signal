use axum::{
    extract::{Json, State},
    http::Method,
    routing::{get, post},
    Router,
};
use bath_signal::*;
use std::{
    net::SocketAddr,
    sync::{Arc, RwLock},
};
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};

pub struct AppState {
    call: RwLock<CallState>,
}

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let state = Arc::new(AppState {
        call: RwLock::new(CallState::new()),
    });

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_origin(Any);

    let app = Router::new()
        .route("/", get(|| async { "Hello, World" }))
        .route("/api/call/create_call", post(api_create_call))
        .route("/api/call/join_query", post(api_join_query))
        .route("/api/call/send_offer", post(api_send_offer))
        .route("/api/call/send_answer", post(api_send_answer))
        .route("/api/call/send_ice", post(api_send_ice))
        .route("/api/call/check_mailbox", post(api_check_mailbox))
        .layer(ServiceBuilder::new().layer(cors))
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn api_create_call(State(state): State<Arc<AppState>>) -> Json<ResCreateCall> {
    let mut call_state = state.call.write().unwrap();

    eprintln!("<=== IN /api/call/create_call ===>\n{:?}\n", ());

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

    eprintln!("<=== OUT /api/call/create_call ===>\n{:?}\n", res);

    Json(res)
}

async fn api_join_query(
    State(state): State<Arc<AppState>>,
    Json(req): Json<JoinQuery>,
) -> Json<ResJoinQuery> {
    let mut call_state = state.call.write().unwrap();

    eprintln!("<=== IN /api/call/join_query ===>\n{:?}\n", req);

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

    eprintln!("<=== OUT /api/call/join_query ===>\n{:?}\n", res);

    Json(res)
}

async fn api_send_offer(
    State(state): State<Arc<AppState>>,
    Json(req): Json<SendOffer>,
) -> Json<ResSendOffer> {
    let mut call_state = state.call.write().unwrap();

    eprintln!("<=== IN /api/call/send_offer ===>\n{:?}\n", req);

    let res = match call_state.send_offer(req) {
        Ok(_) => ResSendOffer { error: None },
        Err(err) => ResSendOffer { error: Some(err) },
    };

    eprintln!("<=== OUT /api/call/send_offer ===>\n{:?}\n", res);

    Json(res)
}

async fn api_send_answer(
    State(state): State<Arc<AppState>>,
    Json(req): Json<SendAnswer>,
) -> Json<ResSendAnswer> {
    let mut call_state = state.call.write().unwrap();

    eprintln!("<=== IN /api/call/send_answer ===>\n{:?}\n", req);

    let res = match call_state.send_answer(req) {
        Ok(_) => ResSendAnswer { error: None },
        Err(err) => ResSendAnswer { error: Some(err) },
    };

    eprintln!("<=== OUT /api/call/send_answer ===>\n{:?}\n", res);

    Json(res)
}

async fn api_send_ice(
    State(state): State<Arc<AppState>>,
    Json(req): Json<SendICE>,
) -> Json<ResSendICE> {
    let mut call_state = state.call.write().unwrap();

    eprintln!("<=== IN /api/call/send_ice ===>\n{:?}\n", req);

    let res = match call_state.send_ice(req) {
        Ok(_) => ResSendICE { error: None },
        Err(err) => ResSendICE { error: Some(err) },
    };

    eprintln!("<=== OUT /api/call/send_ice ===>\n{:?}\n", res);

    Json(res)
}

async fn api_check_mailbox(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CheckMailbox>,
) -> Json<ResCheckMailbox> {
    let mut call_state = state.call.write().unwrap();

    eprintln!("<=== IN /api/call/check_mailbox ===>\n{:?}\n", req);

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

    eprintln!("<=== OUT /api/call/check_mailbox ===>\n{:?}\n", res);

    Json(res)
}
