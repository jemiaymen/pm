
#mongo config

MONGO_HOST = 'localhost'
MONGO_PORT = 27017
MONGO_DBNAME = 'pm'

#MONGO_USERNAME = 'jemix'
#MONGO_PASSWORD = 'sdfpro'

################end config ############################

###############Config schema ##########################

auth_schema = {
    # Schema definition, based on Cerberus grammar. Check the Cerberus project
    # (https://github.com/nicolaiarocci/cerberus) for details.
    'login': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 20,
        'required' : True,
        'unique' : True,
    },
    'pw': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 60,
        'required' : True,
    },
    'role': {
        'type': 'string',
        'allowed': ["admin", "superadmin", "zawali"],
        'required' : True,
    },
    'token': {
        'type': 'string',
    },
    'user': {
        'type': 'objectid',
        'data_relation': {
            'resource': 'user',
            'field': '_id',
            'embeddable' : True,
        },
        'required' : True,
    },
}


grade_schema = {

    'title': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 500,
        'required' : True,
    },
    'core': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 500,
        'required' : True,
    },
    'ref': {
        'type': 'string',
    }
}



struct_schema = {

    'struct': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 500,
        'required' : True,
    },
    'substruct' : {
        'type' :'list',
        'schema' : {
            'type' : 'dict',
            'schema' : {
                'substruct' : {
                    'type' : 'string'
                },
                'subsubstruct' : {
                    'type' : 'list',
                    'schema' : {
                        'type': 'string'
                    }
                }
            }
        }
    },
    'ref': {
        'type': 'string',
    }
}


fct_schema = {

    'title': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 500,
        'required' : True,
    },
    'ref': {
        'type': 'string',
    }
}


doc_schema = {

    'title': {
        'type': 'string',
        'required' : True,
    },
    'src' : {
        'type': 'string',
        'required' : True, 
    },
    'ref': {
        'type': 'string',
    },
    'dt': {
        'type': 'datetime',
        'required' : True, 
    },
    'user': {
        'type': 'objectid',
        'data_relation': {
            'resource': 'user',
            'field': '_id',
            'embeddable' : True,
        },
        'required' : True,
    },
    
}

# User Schema definition
user_schema = {

    'uid': {
        'type': 'string',
        'required': True,
        'minlength': 10,
        'maxlength': 20,
        'unique': True,
    },
    'nom': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 40,
        'required' : True,
    },
    'pren': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 40,
        'required' : True,
    },
    'father': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 40,
        'required' : True,
    },
    'mother': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 40,
        'required' : True,
    },
    'gender': {
        'type': 'string',
        'required' : True,
    },
    'born': {
        'type': 'datetime',
        'required' : True,
    },
    'dtenter': {
        'type': 'datetime',
        'required' : True,
    },
    'cin': {
        'type' : 'dict',
        'required' : True,
        'schema' : {
            'num': {
                'type': 'string',
                'minlength': 8,
                'maxlength': 12,
                'required': True,
                'unique': True,
            },
            'dt': {
                'type': 'datetime',
                'required' : True,
            },
            'address':{
                'type': 'string',
                'required' : True,
            }
        }
    },

    'tel':{
        'type': 'integer',
        'min': 20000000,
    },
    'email':{
        'type': 'string',
    },

    'location': {
        'type': 'dict',
        'schema': {
            'address': {'type': 'string'},
            'city': {'type': 'string'},
        }
     },
     
    'familystate' : {
    	'type' : 'dict',
    	'schema' : {
    		'r': {
    			'type': 'string',
        		'required' : True,
    		},
            'cong' : {
                'type' : 'dict',
                'schema' : {
                    'name' : { 'type' : 'string'},
                    'born' : { 'type': 'datetime'},
                    'job' : { 'type' : 'string'},
                    'tel' : { 'type' : 'string'},
                },

            },
            'kids': {
                'type': 'list',
                'schema' :{
                    'type': 'dict',
                    'schema': {
                        'name' : { 'type' : 'string'},
                        'born' : { 'type': 'datetime'},
                        'gender': {'type': 'string'},
                     }
                 }
             },


    	}
    },
    'edu' : {
    	'type' : 'dict',
    	'schema' : {
    		'title': {
    			'type': 'string',
        		'required' : True,
    		},
    		'niv' : {
    			'type': 'string',
                'required' : True,
    		},
            'src' : {
                'type' : 'string',
            },
            'univ': {
                'type': 'string',
            },
    		'nbr': {
    			'type': 'integer',
    		},
    		'dt': {
    			'type': 'datetime',
    		},
    	}
    },
    'certif' : {
        'type' : 'list' ,
        'schema' : {
            'type' : 'dict',
            'schema' : {
                'title': {
                    'type': 'string',
                    'required' : True,
                },
                'src' : {
                    'type' : 'string',
                },
                'ref': {
                    'type': 'string',
                },
                'f': {
                    'type': 'datetime',
                },
                'to': {
                    'type': 'datetime',
                },
            }
        }
    	
    },

    'fct': {
        'type': 'list',
        'schema' :{
            'type': 'dict',
            'schema': {
                'fct': {
                    'type': 'string',
                    'required' : True,
                },
                'ref' : {
                    'type' : 'string',
                    'required' : True,
                },
                'dt' : {
                    'type' : 'datetime',
                    'required' : True,
                }
            }
        }
    },

    'grade': {
        'type': 'list',
        'schema' :{
            'type': 'dict',
            'schema': {
                'grade': {
                    'type': 'string',
                    'required' : True,
                },
                'ref' : {
                    'type' : 'string',
                    'required' : True,
                },
                'dt' : {
                    'type' : 'datetime',
                    'required' : True,
                }
            }
        }
    },

    'state': {
        'type': 'list',
        'schema' : {
            'type': 'dict',
            'schema' : {

                'st': {
                'type': 'string',
                'required' : True,
                },
                'dt' : {
                    'type' : 'datetime',
                    'required' : True,
                },
                'ref' : {
                    'type' : 'string'
                },

            }
            

        }
    },

    'aff' :{
        'type' : 'list',
        'schema' : {
            'type':'dict',
            'schema' : {
                'struct' : {'type': 'string' , 'required' : True},
                'substruct' : {'type': 'string' },
                'subsubstruct' : {'type': 'string'},
                'ref' : {'type' : 'string'},
                'dt' : { 'type': 'datetime' ,'required' : True},
            }
        }
    },
    'avatar' : {
        'type' : 'string',
        'required' : True,
    }


}


#config schema definiton

config_schema = {

    'uid': {
        'type' : 'boolean',
        'required' : True,
    },
    'nompren': {
        'type' : 'boolean',
        'required' : True,
    },
    'father': {
        'type' : 'boolean',
        'required' : True,
    },
    'mother': {
        'type' : 'boolean',
        'required' : True,
    },
    'gender': {
        'type' : 'boolean',
        'required' : True,
    },
    'born': {
        'type' : 'boolean',
        'required' : True,
    },
    'dtenter': {
        'type' : 'boolean',
        'required' : True,
    },
    'cin': {
        'type' : 'boolean',
        'required' : True,
    },
    'othercin': {
        'type' : 'boolean',
        'required' : True,
    },
    'tel':{
        'type' : 'boolean',
        'required' : True,
    },
    'email':{
        'type' : 'boolean',
        'required' : True,
    },
    'location': {
        'type' : 'boolean',
        'required' : True,
    },

    'familystate' : {
        'type' : 'boolean',
        'required' : True,
    },

    'edu' : {
        'type' : 'boolean',
        'required' : True,
    },
    'state' : {
        'type' : 'boolean',
        'required' : True,
        
    },



}

################ end config ############################


################ config data validator #################

user = {
	'item_title': 'user',

    'additional_lookup': {
        'url': 'regex("[0-9]{10,20}")',
        'field': 'uid',
    },

    # We choose to override global cache-control directives for this resource.
    'cache_control': 'max-age=10,must-revalidate',
    'cache_expires': 10,

    # most global settings can be overridden at resource level
	'schema' : user_schema,
	

	'allowed_roles' : ['admin','superadmin'],


}

auth = {
	'item_title': 'Authentification',

    'additional_lookup': {
        'url': 'regex("[a-zA-Z0-9]{3,20}")',
        'field': 'login',
    },

    # We choose to override global cache-control directives for this resource.
    'cache_control': 'max-age=10,must-revalidate',
    'cache_expires': 10,
    'schema' : auth_schema,
    'extra_response_fields': ['token'],

    # most global settings can be overridden at resource level
    'resource_methods': ['GET', 'POST'],
	

	'allowed_roles' : ['admin','superadmin'],

	'public_methods': ['GET'],
    'public_item_methods': ['GET'],



}



doc = {
    'item_title': 'Avatar',

    'additional_lookup': {
        'url': 'regex("[a-f0-9]{24}")',
        'field' : 'user',
    },

    # We choose to override global cache-control directives for this resource.
    'cache_control': 'max-age=10,must-revalidate',
    'cache_expires': 10,
    'schema' : doc_schema,
    'extra_response_fields': ['token'],

    # most global settings can be overridden at resource level
    'resource_methods': ['GET', 'POST'],
    

    'allowed_roles' : ['admin','superadmin'],
}


config = {
    'item_title': 'config',


    # We choose to override global cache-control directives for this resource.
    'cache_control': 'max-age=10,must-revalidate',
    'cache_expires': 10,

    # most global settings can be overridden at resource level
    'schema' : config_schema,




    

    'allowed_roles' : ['superadmin','admin'],


}

fct = {
    'item_title': 'fonction',
    'cache_expires': 10,
    'schema' : fct_schema,
    'allowed_roles' : ['superadmin','admin'],

}


grade = {
    'item_title': 'grade',
    'cache_expires': 10,
    'schema' : grade_schema,
    'allowed_roles' : ['superadmin','admin'],

}

struct = {
    'item_title': 'struct',
    'cache_expires': 10,
    'schema' : struct_schema,
    'allowed_roles' : ['superadmin','admin'],
}


################ end config ############################


#eve config global

#XML = False

RESOURCE_METHODS = ['GET', 'POST', 'DELETE']

ITEM_METHODS = ['GET', 'PATCH', 'PUT', 'DELETE']

DOMAIN = {
            'user': user ,'auth' : auth ,'config' : config ,
            'doc' : doc , 'fct' : fct,
            'grade' : grade, 'struct': struct
        }

X_DOMAINS = '*'
X_HEADERS = ['Authorization','Content-type','If-Match']
X_ALLOW_CREDENTIALS = True
PAGINATION_LIMIT = 2000
MONGO_QUERY_BLACKLIST = ['$where']






################end config ############################
