// Generated from grammar/EBNF.g4 by ANTLR 4.13.1
// jshint ignore: start
import antlr4 from 'antlr4';


const serializedATN = [4,0,12,57,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,
4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,1,0,1,
0,1,0,1,0,1,1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,6,1,6,1,7,1,7,1,8,1,
8,1,9,1,9,1,10,1,10,4,10,50,8,10,11,10,12,10,51,1,11,1,11,1,11,1,11,0,0,
12,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,1,0,3,2,0,65,
90,97,122,5,0,32,32,45,45,48,57,65,90,97,122,3,0,9,10,13,13,32,32,57,0,1,
1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,
1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,
1,25,1,0,0,0,3,29,1,0,0,0,5,31,1,0,0,0,7,33,1,0,0,0,9,35,1,0,0,0,11,37,1,
0,0,0,13,39,1,0,0,0,15,41,1,0,0,0,17,43,1,0,0,0,19,45,1,0,0,0,21,47,1,0,
0,0,23,53,1,0,0,0,25,26,5,58,0,0,26,27,5,58,0,0,27,28,5,61,0,0,28,2,1,0,
0,0,29,30,5,41,0,0,30,4,1,0,0,0,31,32,5,40,0,0,32,6,1,0,0,0,33,34,5,125,
0,0,34,8,1,0,0,0,35,36,5,123,0,0,36,10,1,0,0,0,37,38,5,93,0,0,38,12,1,0,
0,0,39,40,5,91,0,0,40,14,1,0,0,0,41,42,5,124,0,0,42,16,1,0,0,0,43,44,5,62,
0,0,44,18,1,0,0,0,45,46,5,60,0,0,46,20,1,0,0,0,47,49,7,0,0,0,48,50,7,1,0,
0,49,48,1,0,0,0,50,51,1,0,0,0,51,49,1,0,0,0,51,52,1,0,0,0,52,22,1,0,0,0,
53,54,7,2,0,0,54,55,1,0,0,0,55,56,6,11,0,0,56,24,1,0,0,0,2,0,51,1,6,0,0];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

export default class EBNFLexer extends antlr4.Lexer {

    static grammarFileName = "EBNF.g4";
    static channelNames = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	static modeNames = [ "DEFAULT_MODE" ];
	static literalNames = [ null, "'::='", "')'", "'('", "'}'", "'{'", "']'", 
                         "'['", "'|'", "'>'", "'<'" ];
	static symbolicNames = [ null, "ASSIGN", "Right_Parenthesis", "Left_Parenthesis", 
                          "Right_Curly_Bracket", "Left_Curly_Bracket", "Right_Square_Bracket", 
                          "Left_Square_Bracket", "Vertical_Line", "Greater_Than_Sign", 
                          "Less_Than_Sign", "ID", "WS" ];
	static ruleNames = [ "ASSIGN", "Right_Parenthesis", "Left_Parenthesis", 
                      "Right_Curly_Bracket", "Left_Curly_Bracket", "Right_Square_Bracket", 
                      "Left_Square_Bracket", "Vertical_Line", "Greater_Than_Sign", 
                      "Less_Than_Sign", "ID", "WS" ];

    constructor(input) {
        super(input)
        this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.atn.PredictionContextCache());
    }
}

EBNFLexer.EOF = antlr4.Token.EOF;
EBNFLexer.ASSIGN = 1;
EBNFLexer.Right_Parenthesis = 2;
EBNFLexer.Left_Parenthesis = 3;
EBNFLexer.Right_Curly_Bracket = 4;
EBNFLexer.Left_Curly_Bracket = 5;
EBNFLexer.Right_Square_Bracket = 6;
EBNFLexer.Left_Square_Bracket = 7;
EBNFLexer.Vertical_Line = 8;
EBNFLexer.Greater_Than_Sign = 9;
EBNFLexer.Less_Than_Sign = 10;
EBNFLexer.ID = 11;
EBNFLexer.WS = 12;



