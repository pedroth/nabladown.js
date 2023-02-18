import { TEXT_SYMBOL } from "./Lexer";

ParserGenerator.builder()
    .token("\n", (t) => t.type === "\n")
    .token("#", (t) => t.type === "#")
    .token(TEXT_SYMBOL, (t) => t.type === TEXT_SYMBOL)
    .token(" ", (t) => t.type === " ")
    .rule("Document").definedAs(
        or(
            sequence(
                nonTerminal("Paragraph"),
                nonTerminal("Document")
            ),
            empty()
        )
    )
    .rule("Paragraph").definedAs(
        sequence(
            nonTerminal("Statement"), token("\n")
        )
    )
    .rule("Statement").definedAs(
        or(
            nonTerminal("Title"),
            nonTerminal("List", 0),
            nonTerminal("Expression"),
            nonTerminal("Break"),
        )
    )
    .rule("Title").definedAs(
        sequence(
            token("#"), token(" "), nonTerminal("Expression")
        )
    )
    .build()
