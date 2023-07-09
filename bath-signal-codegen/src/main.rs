use bath_signal::*;
use schemajen::{accumulator_choose_with_str, codegen, generate, TypeAccumulator};
use serde::Serialize;

fn gen_ty<T: Serialize>(mut acc: Box<dyn TypeAccumulator>, name: &str, sample: T) {
    let json = serde_json::to_string(&sample).unwrap();
    println!("{}\n", generate(acc.as_mut(), name, &json).unwrap());
}

fn new_acc(lang: &str) -> Box<dyn TypeAccumulator> {
    accumulator_choose_with_str(lang).unwrap_or_else(|| {
        panic!(
            "Got bad codegen language, could be {:?}.",
            codegen::ACCUMULATOR_SUPPORT_LIST
        )
    })
}

fn main() {
    let Some(lang) = std::env::args().nth(1) else {
        panic!("Expected codegen language, could be: {:?}.", codegen::ACCUMULATOR_SUPPORT_LIST)
    };

    //  ResCreateCall
    gen_ty(
        new_acc(&lang),
        "ResCreateCall",
        ResCreateCall {
            error: None,
            res: Some(CreateCallOut { call: CallId(0) }),
        },
    );

    //  JoinQuery
    gen_ty(
        new_acc(&lang),
        "JoinQuery",
        JoinQuery {
            call: CallId(0),
            user: UserId(String::from("Hi")),
        },
    );

    //  ResJoinQuery
    gen_ty(
        new_acc(&lang),
        "ResJoinQuery",
        ResJoinQuery {
            error: Some(JoinQueryError::InvalidCallId),
            res: Some(JoinQueryOut {
                users: vec![UserId(String::from("Hi"))],
            }),
        },
    );

    //  SendOffer
    gen_ty(
        new_acc(&lang),
        "SendOffer",
        SendOffer {
            user: UserId(String::from("Hi")),
            offer: String::from("Hi"),
        },
    );

    //  ResSendOffer
    gen_ty(
        new_acc(&lang),
        "ResSendOffer",
        ResSendOffer {
            error: Some(SendOfferError::InvalidCallId),
        },
    );

    //  SendAnswer
    gen_ty(
        new_acc(&lang),
        "SendAnswer",
        SendAnswer {
            user: UserId(String::from("Hi")),
            answer: String::from("Hi"),
        },
    );

    //  ResSendAnswer
    gen_ty(
        new_acc(&lang),
        "ResSendAnswer",
        ResSendAnswer {
            error: Some(SendAnswerError::InvalidUserId),
        },
    );

    //  CheckMailbox
    gen_ty(
        new_acc(&lang),
        "CheckMailbox",
        CheckMailbox {
            user: UserId(String::from("Hi")),
        },
    );

    //  ResCheckMailbox
    gen_ty(
        new_acc(&lang),
        "ResCheckMailbox",
        ResCheckMailbox {
            error: Some(CheckMailboxError::InvalidUserId),
            res: Some(CheckMailboxOut {
                messages: vec![
                    UserMail {
                        ty: UserMailType::IncomingOffer,
                        data: String::from("Hi"),
                    },
                    UserMail {
                        ty: UserMailType::IncomingAnswer,
                        data: String::from("Hi"),
                    },
                    UserMail {
                        ty: UserMailType::IncomingICE,
                        data: String::from("Hi"),
                    },
                ],
            }),
        },
    );
}
