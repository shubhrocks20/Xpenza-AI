const demoSchema = {
    "context" : {
        "type" : "object",
        "properties" : {
            "message_id" : {"type" : "string", "enum": ['abc', 'def']},
        },
        "required" : ["message_id"]
    }
}