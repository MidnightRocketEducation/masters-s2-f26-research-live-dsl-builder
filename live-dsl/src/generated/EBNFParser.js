// Generated from grammar/EBNF.g4 by ANTLR 4.13.1
// jshint ignore: start
import antlr4 from 'antlr4';
import EBNFListener from './EBNFListener.js';
import EBNFVisitor from './EBNFVisitor.js';

const serializedATN = [4,1,12,84,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,
2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,1,
0,5,0,28,8,0,10,0,12,0,31,9,0,1,0,1,0,1,1,1,1,1,1,1,1,1,2,1,2,1,3,1,3,1,
4,1,4,1,4,5,4,46,8,4,10,4,12,4,49,9,4,1,5,5,5,52,8,5,10,5,12,5,55,9,5,1,
6,1,6,1,6,1,6,1,6,3,6,62,8,6,1,7,1,7,1,7,1,7,1,8,1,8,1,8,1,8,1,9,1,9,1,9,
1,9,1,10,1,10,1,11,1,11,1,11,1,11,1,12,1,12,1,12,0,0,13,0,2,4,6,8,10,12,
14,16,18,20,22,24,0,0,77,0,29,1,0,0,0,2,34,1,0,0,0,4,38,1,0,0,0,6,40,1,0,
0,0,8,42,1,0,0,0,10,53,1,0,0,0,12,61,1,0,0,0,14,63,1,0,0,0,16,67,1,0,0,0,
18,71,1,0,0,0,20,75,1,0,0,0,22,77,1,0,0,0,24,81,1,0,0,0,26,28,3,2,1,0,27,
26,1,0,0,0,28,31,1,0,0,0,29,27,1,0,0,0,29,30,1,0,0,0,30,32,1,0,0,0,31,29,
1,0,0,0,32,33,5,0,0,1,33,1,1,0,0,0,34,35,3,4,2,0,35,36,5,1,0,0,36,37,3,6,
3,0,37,3,1,0,0,0,38,39,3,22,11,0,39,5,1,0,0,0,40,41,3,8,4,0,41,7,1,0,0,0,
42,47,3,10,5,0,43,44,5,8,0,0,44,46,3,10,5,0,45,43,1,0,0,0,46,49,1,0,0,0,
47,45,1,0,0,0,47,48,1,0,0,0,48,9,1,0,0,0,49,47,1,0,0,0,50,52,3,12,6,0,51,
50,1,0,0,0,52,55,1,0,0,0,53,51,1,0,0,0,53,54,1,0,0,0,54,11,1,0,0,0,55,53,
1,0,0,0,56,62,3,14,7,0,57,62,3,16,8,0,58,62,3,18,9,0,59,62,3,20,10,0,60,
62,3,22,11,0,61,56,1,0,0,0,61,57,1,0,0,0,61,58,1,0,0,0,61,59,1,0,0,0,61,
60,1,0,0,0,62,13,1,0,0,0,63,64,5,7,0,0,64,65,3,8,4,0,65,66,5,6,0,0,66,15,
1,0,0,0,67,68,5,5,0,0,68,69,3,8,4,0,69,70,5,4,0,0,70,17,1,0,0,0,71,72,5,
3,0,0,72,73,3,8,4,0,73,74,5,2,0,0,74,19,1,0,0,0,75,76,5,11,0,0,76,21,1,0,
0,0,77,78,5,10,0,0,78,79,3,24,12,0,79,80,5,9,0,0,80,23,1,0,0,0,81,82,5,11,
0,0,82,25,1,0,0,0,4,29,47,53,61];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class EBNFParser extends antlr4.Parser {

    static grammarFileName = "EBNF.g4";
    static literalNames = [ null, "'::='", "')'", "'('", "'}'", "'{'", "']'", 
                            "'['", "'|'", "'>'", "'<'" ];
    static symbolicNames = [ null, "ASSIGN", "Right_Parenthesis", "Left_Parenthesis", 
                             "Right_Curly_Bracket", "Left_Curly_Bracket", 
                             "Right_Square_Bracket", "Left_Square_Bracket", 
                             "Vertical_Line", "Greater_Than_Sign", "Less_Than_Sign", 
                             "ID", "WS" ];
    static ruleNames = [ "rulelist", "rule_", "lhs", "rhs", "alternatives", 
                         "alternative", "element", "optional_", "zeroormore", 
                         "oneormore", "text_", "id_", "ruleid" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = EBNFParser.ruleNames;
        this.literalNames = EBNFParser.literalNames;
        this.symbolicNames = EBNFParser.symbolicNames;
    }



	rulelist() {
	    let localctx = new RulelistContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, EBNFParser.RULE_rulelist);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 29;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===10) {
	            this.state = 26;
	            this.rule_();
	            this.state = 31;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 32;
	        this.match(EBNFParser.EOF);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	rule_() {
	    let localctx = new Rule_Context(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, EBNFParser.RULE_rule_);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 34;
	        this.lhs();
	        this.state = 35;
	        this.match(EBNFParser.ASSIGN);
	        this.state = 36;
	        this.rhs();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	lhs() {
	    let localctx = new LhsContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, EBNFParser.RULE_lhs);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 38;
	        this.id_();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	rhs() {
	    let localctx = new RhsContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, EBNFParser.RULE_rhs);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 40;
	        this.alternatives();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	alternatives() {
	    let localctx = new AlternativesContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, EBNFParser.RULE_alternatives);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 42;
	        this.alternative();
	        this.state = 47;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===8) {
	            this.state = 43;
	            this.match(EBNFParser.Vertical_Line);
	            this.state = 44;
	            this.alternative();
	            this.state = 49;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	alternative() {
	    let localctx = new AlternativeContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, EBNFParser.RULE_alternative);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 53;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,2,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 50;
	                this.element(); 
	            }
	            this.state = 55;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,2,this._ctx);
	        }

	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	element() {
	    let localctx = new ElementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, EBNFParser.RULE_element);
	    try {
	        this.state = 61;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 7:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 56;
	            this.optional_();
	            break;
	        case 5:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 57;
	            this.zeroormore();
	            break;
	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 58;
	            this.oneormore();
	            break;
	        case 11:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 59;
	            this.text_();
	            break;
	        case 10:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 60;
	            this.id_();
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	optional_() {
	    let localctx = new Optional_Context(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, EBNFParser.RULE_optional_);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 63;
	        this.match(EBNFParser.Left_Square_Bracket);
	        this.state = 64;
	        this.alternatives();
	        this.state = 65;
	        this.match(EBNFParser.Right_Square_Bracket);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	zeroormore() {
	    let localctx = new ZeroormoreContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 16, EBNFParser.RULE_zeroormore);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 67;
	        this.match(EBNFParser.Left_Curly_Bracket);
	        this.state = 68;
	        this.alternatives();
	        this.state = 69;
	        this.match(EBNFParser.Right_Curly_Bracket);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	oneormore() {
	    let localctx = new OneormoreContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 18, EBNFParser.RULE_oneormore);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 71;
	        this.match(EBNFParser.Left_Parenthesis);
	        this.state = 72;
	        this.alternatives();
	        this.state = 73;
	        this.match(EBNFParser.Right_Parenthesis);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	text_() {
	    let localctx = new Text_Context(this, this._ctx, this.state);
	    this.enterRule(localctx, 20, EBNFParser.RULE_text_);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 75;
	        this.match(EBNFParser.ID);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	id_() {
	    let localctx = new Id_Context(this, this._ctx, this.state);
	    this.enterRule(localctx, 22, EBNFParser.RULE_id_);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 77;
	        this.match(EBNFParser.Less_Than_Sign);
	        this.state = 78;
	        this.ruleid();
	        this.state = 79;
	        this.match(EBNFParser.Greater_Than_Sign);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	ruleid() {
	    let localctx = new RuleidContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 24, EBNFParser.RULE_ruleid);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 81;
	        this.match(EBNFParser.ID);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

EBNFParser.EOF = antlr4.Token.EOF;
EBNFParser.ASSIGN = 1;
EBNFParser.Right_Parenthesis = 2;
EBNFParser.Left_Parenthesis = 3;
EBNFParser.Right_Curly_Bracket = 4;
EBNFParser.Left_Curly_Bracket = 5;
EBNFParser.Right_Square_Bracket = 6;
EBNFParser.Left_Square_Bracket = 7;
EBNFParser.Vertical_Line = 8;
EBNFParser.Greater_Than_Sign = 9;
EBNFParser.Less_Than_Sign = 10;
EBNFParser.ID = 11;
EBNFParser.WS = 12;

EBNFParser.RULE_rulelist = 0;
EBNFParser.RULE_rule_ = 1;
EBNFParser.RULE_lhs = 2;
EBNFParser.RULE_rhs = 3;
EBNFParser.RULE_alternatives = 4;
EBNFParser.RULE_alternative = 5;
EBNFParser.RULE_element = 6;
EBNFParser.RULE_optional_ = 7;
EBNFParser.RULE_zeroormore = 8;
EBNFParser.RULE_oneormore = 9;
EBNFParser.RULE_text_ = 10;
EBNFParser.RULE_id_ = 11;
EBNFParser.RULE_ruleid = 12;

class RulelistContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_rulelist;
    }

	EOF() {
	    return this.getToken(EBNFParser.EOF, 0);
	};

	rule_ = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(Rule_Context);
	    } else {
	        return this.getTypedRuleContext(Rule_Context,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterRulelist(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitRulelist(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitRulelist(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class Rule_Context extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_rule_;
    }

	lhs() {
	    return this.getTypedRuleContext(LhsContext,0);
	};

	ASSIGN() {
	    return this.getToken(EBNFParser.ASSIGN, 0);
	};

	rhs() {
	    return this.getTypedRuleContext(RhsContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterRule_(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitRule_(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitRule_(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class LhsContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_lhs;
    }

	id_() {
	    return this.getTypedRuleContext(Id_Context,0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterLhs(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitLhs(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitLhs(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class RhsContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_rhs;
    }

	alternatives() {
	    return this.getTypedRuleContext(AlternativesContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterRhs(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitRhs(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitRhs(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class AlternativesContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_alternatives;
    }

	alternative = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(AlternativeContext);
	    } else {
	        return this.getTypedRuleContext(AlternativeContext,i);
	    }
	};

	Vertical_Line = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(EBNFParser.Vertical_Line);
	    } else {
	        return this.getToken(EBNFParser.Vertical_Line, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterAlternatives(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitAlternatives(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitAlternatives(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class AlternativeContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_alternative;
    }

	element = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ElementContext);
	    } else {
	        return this.getTypedRuleContext(ElementContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterAlternative(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitAlternative(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitAlternative(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ElementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_element;
    }

	optional_() {
	    return this.getTypedRuleContext(Optional_Context,0);
	};

	zeroormore() {
	    return this.getTypedRuleContext(ZeroormoreContext,0);
	};

	oneormore() {
	    return this.getTypedRuleContext(OneormoreContext,0);
	};

	text_() {
	    return this.getTypedRuleContext(Text_Context,0);
	};

	id_() {
	    return this.getTypedRuleContext(Id_Context,0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterElement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitElement(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitElement(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class Optional_Context extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_optional_;
    }

	Left_Square_Bracket() {
	    return this.getToken(EBNFParser.Left_Square_Bracket, 0);
	};

	alternatives() {
	    return this.getTypedRuleContext(AlternativesContext,0);
	};

	Right_Square_Bracket() {
	    return this.getToken(EBNFParser.Right_Square_Bracket, 0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterOptional_(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitOptional_(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitOptional_(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ZeroormoreContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_zeroormore;
    }

	Left_Curly_Bracket() {
	    return this.getToken(EBNFParser.Left_Curly_Bracket, 0);
	};

	alternatives() {
	    return this.getTypedRuleContext(AlternativesContext,0);
	};

	Right_Curly_Bracket() {
	    return this.getToken(EBNFParser.Right_Curly_Bracket, 0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterZeroormore(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitZeroormore(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitZeroormore(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class OneormoreContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_oneormore;
    }

	Left_Parenthesis() {
	    return this.getToken(EBNFParser.Left_Parenthesis, 0);
	};

	alternatives() {
	    return this.getTypedRuleContext(AlternativesContext,0);
	};

	Right_Parenthesis() {
	    return this.getToken(EBNFParser.Right_Parenthesis, 0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterOneormore(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitOneormore(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitOneormore(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class Text_Context extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_text_;
    }

	ID() {
	    return this.getToken(EBNFParser.ID, 0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterText_(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitText_(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitText_(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class Id_Context extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_id_;
    }

	Less_Than_Sign() {
	    return this.getToken(EBNFParser.Less_Than_Sign, 0);
	};

	ruleid() {
	    return this.getTypedRuleContext(RuleidContext,0);
	};

	Greater_Than_Sign() {
	    return this.getToken(EBNFParser.Greater_Than_Sign, 0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterId_(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitId_(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitId_(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class RuleidContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_ruleid;
    }

	ID() {
	    return this.getToken(EBNFParser.ID, 0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterRuleid(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitRuleid(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof EBNFVisitor ) {
	        return visitor.visitRuleid(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}




EBNFParser.RulelistContext = RulelistContext; 
EBNFParser.Rule_Context = Rule_Context; 
EBNFParser.LhsContext = LhsContext; 
EBNFParser.RhsContext = RhsContext; 
EBNFParser.AlternativesContext = AlternativesContext; 
EBNFParser.AlternativeContext = AlternativeContext; 
EBNFParser.ElementContext = ElementContext; 
EBNFParser.Optional_Context = Optional_Context; 
EBNFParser.ZeroormoreContext = ZeroormoreContext; 
EBNFParser.OneormoreContext = OneormoreContext; 
EBNFParser.Text_Context = Text_Context; 
EBNFParser.Id_Context = Id_Context; 
EBNFParser.RuleidContext = RuleidContext; 
