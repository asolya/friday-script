function isAlpha(ch){
    return typeof ch === "string" && ch.length === 1
        && (ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z");
}

function isNum(ch){
    return typeof ch === "string" && ch.length === 1
        && (ch >= "0" && ch <= "9");
}

function isAlphaNum(ch) {
    return isAlpha(ch) || isNum(ch)
}

function isSpace(ch) {
    return typeof ch === "string" && ch.length === 1
    && (ch === " " || ch === "\t" || ch === "\n" || ch === "\r");
}

function isSpecial(ch) {
    return /^[.,\[\];=()]$/i.test(ch);
}

function getType(ch) {
    if (isAlpha(ch)) {
        return "alpha";
    }

    if (isNum(ch)) {
        return "num";
    }

    if (isSpace(ch)) {
        return "space";
    }

    if (isSpecial(ch)) {
        return "special";
    }

    throw new Error(`Unknown character is ${ch}.`);
}

function lexer(content) {

    const lexems = [];

    for (let begin = 0; begin < content.length;) {
        let end = begin + 1;

        const beginType = getType(content[begin]);

        while(end < content.length) {
            if (beginType === "alpha" && isAlphaNum(content[end]) 
                || beginType === "num" && isNum(content[end]) 
                || beginType === "space" && isSpace(content[end])) {

                end++;
                continue;
            }
            break;
        }

        const word = content.slice(begin, end);

        switch (word) {
            case "var": {
                lexems.push({ type: "var" });
                break;
            }
            case "(": {
                lexems.push({ type: "open_bracket" });
                break;
            }
            case ")": {
                lexems.push({ type: "close_bracket" });
                break;
            }
            case "=": {
                lexems.push({ type: "equal" });
                break;
            }
            case ",": {
                lexems.push({ type: "comma" });
                break;
            }
            case ";": {
                lexems.push({ type: "semicolon" });
                break;
            }
            default: {
                switch (beginType) {
                    case "alpha": {
                        lexems.push({ type: "id", value: word });
                        break;
                    } 
                    case "num": {
                        lexems.push({ type: "num", value: parseInt(word, 10) });
                        break;
                    } 
                    case "space": {
                        //no op
                        break;
                    }
                    case "special": {
                        throw new Error(`It shouldn't be the case: ${word}`);
                    } 
                    default: {
                        throw new Error(`Unknown begin type - ${beginType}`);
                    }
                }
            }
        }
        begin = end;
    }
    return lexems;
}

module.exports = lexer;