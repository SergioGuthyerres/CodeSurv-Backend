## inserção dos 10 primeiros easys:
[

  {
    "title": "Dobro do número",
    "description": "Dado um número inteiro n, retorne o dobro de n.",
    "difficulty": "easy",
    "tags": [
      "math",
      "beginner"
    ],
    "languages": [
      "javascript",
      "python"
    ],
    "functionSig": {
      "javascript": "function solve(n){",
      "python": "def solve(n):\n "
    },
    "testCases": [
      {
        "input": [
          3
        ],
        "expected": 6,
        "isPublic": true
      },
      {
        "input": [
          7
        ],
        "expected": 14,
        "isPublic": true
      },
      {
        "input": [
          -4
        ],
        "expected": -8,
        "isPublic": true
      },
      {
        "input": [
          0
        ],
        "expected": 0,
        "isPublic": false
      },
      {
        "input": [
          1
        ],
        "expected": 2,
        "isPublic": false
      },
      {
        "input": [
          100
        ],
        "expected": 200,
        "isPublic": false
      }
    ]
  },
  {
    "title": "É par?",
    "description": "Dado um número inteiro n, retorne true se n for par, ou false se for ímpar.",
    "difficulty": "easy",
    "tags": [
      "math",
      "logic"
    ],
    "languages": [
      "javascript",
      "python"
    ],
    "functionSig": {
      "javascript": "function solve(n){",
      "python": "def solve(n):\n "
    },
    "testCases": [
      {
        "input": [
          4
        ],
        "expected": true,
        "isPublic": true
      },
      {
        "input": [
          7
        ],
        "expected": false,
        "isPublic": true
      },
      {
        "input": [
          0
        ],
        "expected": true,
        "isPublic": true
      },
      {
        "input": [
          -2
        ],
        "expected": true,
        "isPublic": false
      },
      {
        "input": [
          -3
        ],
        "expected": false,
        "isPublic": false
      },
      {
        "input": [
          1000001
        ],
        "expected": false,
        "isPublic": false
      }
    ]
  },
  {
    "title": "Comprimento da string",
    "description": "Dada uma string s, retorne o número de caracteres que ela contém.",
    "difficulty": "easy",
    "tags": [
      "string",
      "beginner"
    ],
    "languages": [
      "javascript",
      "python"
    ],
    "functionSig": {
      "javascript": "function solve(s){",
      "python": "def solve(s):\n "
    },
    "testCases": [
      {
        "input": [
          "hello"
        ],
        "expected": 5,
        "isPublic": true
      },
      {
        "input": [
          "code"
        ],
        "expected": 4,
        "isPublic": true
      },
      {
        "input": [
          "abc"
        ],
        "expected": 3,
        "isPublic": true
      },
      {
        "input": [
          ""
        ],
        "expected": 0,
        "isPublic": false
      },
      {
        "input": [
          " "
        ],
        "expected": 1,
        "isPublic": false
      },
      {
        "input": [
          "JavaScript"
        ],
        "expected": 10,
        "isPublic": false
      }
    ]
  },
  {
    "title": "Máximo de dois números",
    "description": "Dados dois números inteiros a e b, retorne o maior entre eles.",
    "difficulty": "easy",
    "tags": [
      "math",
      "logic"
    ],
    "languages": [
      "javascript",
      "python"
    ],
    "functionSig": {
      "javascript": "function solve(a, b){",
      "python": "def solve(a, b):\n "
    },
    "testCases": [
      {
        "input": [
          3,
          7
        ],
        "expected": 7,
        "isPublic": true
      },
      {
        "input": [
          10,
          2
        ],
        "expected": 10,
        "isPublic": true
      },
      {
        "input": [
          -1,
          -5
        ],
        "expected": -1,
        "isPublic": true
      },
      {
        "input": [
          0,
          0
        ],
        "expected": 0,
        "isPublic": false
      },
      {
        "input": [
          -3,
          0
        ],
        "expected": 0,
        "isPublic": false
      },
      {
        "input": [
          99,
          100
        ],
        "expected": 100,
        "isPublic": false
      }
    ]
  },
  {
    "title": "Reverter uma string",
    "description": "Dada uma string s, retorne ela escrita ao contrário.",
    "difficulty": "easy",
    "tags": [
      "string"
    ],
    "languages": [
      "javascript",
      "python"
    ],
    "functionSig": {
      "javascript": "function solve(s){",
      "python": "def solve(s):\n "
    },
    "testCases": [
      {
        "input": [
          "hello"
        ],
        "expected": "olleh",
        "isPublic": true
      },
      {
        "input": [
          "abc"
        ],
        "expected": "cba",
        "isPublic": true
      },
      {
        "input": [
          "code"
        ],
        "expected": "edoc",
        "isPublic": true
      },
      {
        "input": [
          ""
        ],
        "expected": "",
        "isPublic": false
      },
      {
        "input": [
          "a"
        ],
        "expected": "a",
        "isPublic": false
      },
      {
        "input": [
          "racecar"
        ],
        "expected": "racecar",
        "isPublic": false
      }
    ]
  },
  {
    "title": "Soma de array",
    "description": "Dado um array de números inteiros nums, retorne a soma de todos os seus elementos.",
    "difficulty": "easy",
    "tags": [
      "array",
      "math"
    ],
    "languages": [
      "javascript",
      "python"
    ],
    "functionSig": {
      "javascript": "function solve(nums){",
      "python": "def solve(nums):\n "
    },
    "testCases": [
      {
        "input": [
          [
            1,
            2,
            3
          ]
        ],
        "expected": 6,
        "isPublic": true
      },
      {
        "input": [
          [
            10,
            -5,
            3
          ]
        ],
        "expected": 8,
        "isPublic": true
      },
      {
        "input": [
          [
            7,
            7,
            7
          ]
        ],
        "expected": 21,
        "isPublic": true
      },
      {
        "input": [
          []
        ],
        "expected": 0,
        "isPublic": false
      },
      {
        "input": [
          [
            0,
            0,
            0
          ]
        ],
        "expected": 0,
        "isPublic": false
      },
      {
        "input": [
          [
            -1,
            -2,
            -3
          ]
        ],
        "expected": -6,
        "isPublic": false
      }
    ]
  },
  {
    "title": "Maiúsculas",
    "description": "Dada uma string s, retorne ela com todas as letras em maiúsculo.",
    "difficulty": "easy",
    "tags": [
      "string"
    ],
    "languages": [
      "javascript",
      "python"
    ],
    "functionSig": {
      "javascript": "function solve(s){",
      "python": "def solve(s):\n "
    },
    "testCases": [
      {
        "input": [
          "hello"
        ],
        "expected": "HELLO",
        "isPublic": true
      },
      {
        "input": [
          "world"
        ],
        "expected": "WORLD",
        "isPublic": true
      },
      {
        "input": [
          "code"
        ],
        "expected": "CODE",
        "isPublic": true
      },
      {
        "input": [
          ""
        ],
        "expected": "",
        "isPublic": false
      },
      {
        "input": [
          "already"
        ],
        "expected": "ALREADY",
        "isPublic": false
      },
      {
        "input": [
          "ABC"
        ],
        "expected": "ABC",
        "isPublic": false
      }
    ]
  },
  {
    "title": "Contagem de elementos",
    "description": "Dado um array nums, retorne a quantidade de elementos que ele possui.",
    "difficulty": "easy",
    "tags": [
      "array",
      "beginner"
    ],
    "languages": [
      "javascript",
      "python"
    ],
    "functionSig": {
      "javascript": "function solve(nums){",
      "python": "def solve(nums):\n "
    },
    "testCases": [
      {
        "input": [
          [
            1,
            2,
            3
          ]
        ],
        "expected": 3,
        "isPublic": true
      },
      {
        "input": [
          [
            10,
            20
          ]
        ],
        "expected": 2,
        "isPublic": true
      },
      {
        "input": [
          [
            5,
            5,
            5,
            5,
            5
          ]
        ],
        "expected": 5,
        "isPublic": true
      },
      {
        "input": [
          []
        ],
        "expected": 0,
        "isPublic": false
      },
      {
        "input": [
          [
            42
          ]
        ],
        "expected": 1,
        "isPublic": false
      },
      {
        "input": [
          [
            1,
            2,
            3,
            4,
            5,
            6,
            7
          ]
        ],
        "expected": 7,
        "isPublic": false
      }
    ]
  },
  {
    "title": "Múltiplo de três",
    "description": "Dado um número inteiro n, retorne true se n for múltiplo de 3, ou false caso contrário.",
    "difficulty": "easy",
    "tags": [
      "math",
      "logic"
    ],
    "languages": [
      "javascript",
      "python"
    ],
    "functionSig": {
      "javascript": "function solve(n){",
      "python": "def solve(n):\n "
    },
    "testCases": [
      {
        "input": [
          9
        ],
        "expected": true,
        "isPublic": true
      },
      {
        "input": [
          7
        ],
        "expected": false,
        "isPublic": true
      },
      {
        "input": [
          0
        ],
        "expected": true,
        "isPublic": true
      },
      {
        "input": [
          -3
        ],
        "expected": true,
        "isPublic": false
      },
      {
        "input": [
          -7
        ],
        "expected": false,
        "isPublic": false
      },
      {
        "input": [
          100
        ],
        "expected": false,
        "isPublic": false
      }
    ]
  },
  {
    "title": "Primeiro elemento",
    "description": "Dado um array nums com pelo menos um elemento, retorne o primeiro elemento.",
    "difficulty": "easy",
    "tags": [
      "array",
      "beginner"
    ],
    "languages": [
      "javascript",
      "python"
    ],
    "functionSig": {
      "javascript": "function solve(nums){",
      "python": "def solve(nums):\n "
    },
    "testCases": [
      {
        "input": [
          [
            1,
            2,
            3
          ]
        ],
        "expected": 1,
        "isPublic": true
      },
      {
        "input": [
          [
            99,
            0,
            -1
          ]
        ],
        "expected": 99,
        "isPublic": true
      },
      {
        "input": [
          [
            -5,
            10,
            3
          ]
        ],
        "expected": -5,
        "isPublic": true
      },
      {
        "input": [
          [
            0
          ]
        ],
        "expected": 0,
        "isPublic": false
      },
      {
        "input": [
          [
            42
          ]
        ],
        "expected": 42,
        "isPublic": false
      },
      {
        "input": [
          [
            7,
            7,
            7,
            7
          ]
        ],
        "expected": 7,
        "isPublic": false
      }
    ]
  }]
