import type { Request } from 'express';

/** OpenAPI 3.0 document for Swagger UI */
export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'PropertyReach API',
    description: 'Backend API for PropertyReach - property listings and mobile OTP authentication',
    version: '1.0.0',
  },
  servers: [] as { url: string; description: string }[],
  tags: [
    { name: 'Health', description: 'Health check' },
    { name: 'Auth', description: 'OTP authentication' },
    { name: 'Listings', description: 'Property listings' },
    { name: 'Admin', description: 'Super admin – onboard/approve agents' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/otp/send': {
      post: {
        tags: ['Auth'],
        summary: 'Send OTP',
        description: 'Send a one-time password to the given NZ mobile number. Valid format: 10–11 domestic digits (e.g. 0211234567 or 02102188860).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mobileNumber'],
                properties: {
                  mobileNumber: { type: 'string', example: '0211234567' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP sent (or logged in dev)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    otp: { type: 'string', description: 'Only in development' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid mobile number format' },
          '500': { description: 'Server error' },
        },
      },
    },
    '/api/auth/setup/status': {
      get: {
        tags: ['Auth'],
        summary: 'First-time setup availability',
        description:
          'Returns whether one-time super-admin bootstrap is available (APP_SETUP_SECRET set and no SUPER_ADMIN yet).',
        responses: {
          '200': {
            description: 'setupAvailable true only when bootstrap may be used once',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    setupAvailable: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '500': { description: 'Server error' },
        },
      },
    },
    '/api/auth/setup/first-super-admin': {
      post: {
        tags: ['Auth'],
        summary: 'Create first super admin (one-time)',
        description:
          'Requires APP_SETUP_SECRET in server env (32+ chars). Allowed only while zero SUPER_ADMIN users exist. Returns JWT like OTP verify.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['setupSecret', 'mobileNumber'],
                properties: {
                  setupSecret: { type: 'string', description: 'Must match APP_SETUP_SECRET' },
                  mobileNumber: { type: 'string', example: '0211234567' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Super admin created; returns token and user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    token: { type: 'string' },
                    user: { type: 'object' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid mobile' },
          '401': { description: 'Invalid setup secret' },
          '403': { description: 'Setup already completed' },
          '409': { description: 'Mobile already registered' },
          '503': { description: 'APP_SETUP_SECRET not configured' },
          '500': { description: 'Server error' },
        },
      },
    },
    '/api/auth/otp/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP',
        description: 'Verify OTP and receive JWT plus user info. When creating a new user (sign-up), include optional agent profile: firstName, lastName, email, agencyName, licenseNumber.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mobileNumber', 'otp'],
                properties: {
                  mobileNumber: { type: 'string', example: '0211234567' },
                  otp: { type: 'string', example: '123456' },
                  firstName: { type: 'string', description: 'Agent sign-up' },
                  lastName: { type: 'string', description: 'Agent sign-up' },
                  email: { type: 'string', description: 'Agent sign-up' },
                  agencyName: { type: 'string', description: 'Agent sign-up' },
                  licenseNumber: { type: 'string', description: 'Agent sign-up (optional)' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Verified; returns token and user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    token: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        mobileNumber: { type: 'string' },
                        role: { type: 'string', enum: ['SUPER_ADMIN', 'AGENT', 'PENDING'] },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string' },
                        agencyName: { type: 'string' },
                        licenseNumber: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid or expired OTP' },
          '500': { description: 'Server error' },
        },
      },
    },
    '/api/admin/agents/info': {
      get: {
        tags: ['Admin'],
        summary: 'Agent onboarding API info',
        description: 'Public. Returns list of agent onboarding endpoints and related DB tables. No auth required.',
        responses: {
          '200': {
            description: 'Endpoint and table info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    description: { type: 'string' },
                    endpoints: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          method: { type: 'string' },
                          path: { type: 'string' },
                          description: { type: 'string' },
                        },
                      },
                    },
                    tables: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/admin/agents/pending': {
      get: {
        tags: ['Admin'],
        summary: 'List pending agent requests',
        description: 'Super admin only. Users who signed up and await approval.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of pending users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          mobileNumber: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                          role: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '403': { description: 'Super admin required' },
        },
      },
    },
    '/api/admin/agents': {
      get: {
        tags: ['Admin'],
        summary: 'List agents',
        description: 'Super admin only. All approved agents.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of agents',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          mobileNumber: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                          isActive: { type: 'boolean' },
                        _count: { type: 'object', properties: { listings: { type: 'integer' } } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '403': { description: 'Super admin required' },
        },
      },
    },
    '/api/admin/agents/{id}/approve': {
      post: {
        tags: ['Admin'],
        summary: 'Onboard agent',
        description: 'Super admin only. Approve a pending user as agent (sets role=AGENT, isActive=true).',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Approved' },
          '400': { description: 'User not pending' },
          '403': { description: 'Super admin required' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/admin/agents/{id}/activate': {
      patch: {
        tags: ['Admin'],
        summary: 'Activate agent',
        description: 'Super admin only. Set agent isActive=true.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Activated' },
          '400': { description: 'User not an agent' },
          '403': { description: 'Super admin required' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/admin/agents/{id}/deactivate': {
      patch: {
        tags: ['Admin'],
        summary: 'Deactivate agent',
        description: 'Super admin only. Set agent isActive=false. Agent will lose access until reactivated.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Deactivated' },
          '400': { description: 'User not an agent' },
          '403': { description: 'Super admin required' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/listings/my': {
      get: {
        tags: ['Listings'],
        summary: "Agent's listings",
        description: "Get the authenticated agent's own listings (all statuses). Requires JWT.",
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of agent listings',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    listings: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Listing' },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/listings': {
      get: {
        tags: ['Listings'],
        summary: 'List listings',
        description: 'Get published listings with optional filters and pagination.',
        parameters: [
          { name: 'listingType', in: 'query', schema: { type: 'string', enum: ['SALE', 'RENT', 'FLATMATES'] } },
          { name: 'region', in: 'query', schema: { type: 'string' } },
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'suburb', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'minBedrooms', in: 'query', schema: { type: 'integer' } },
          { name: 'minBathrooms', in: 'query', schema: { type: 'integer' } },
          { name: 'propertyType', in: 'query', schema: { type: 'string', enum: ['House', 'Apartment', 'Unit', 'Townhouse', 'Lifestyle', 'Land', 'Other'] } },
          { name: 'keyword', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['featured', 'price-asc', 'price-desc', 'latest'] }, description: 'Default: featured' },
          { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Default: 1' },
          { name: 'pageSize', in: 'query', schema: { type: 'integer' }, description: 'Default: 12' },
        ],
        responses: {
          '200': {
            description: 'Paginated listings',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    listings: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Listing' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        pageSize: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '500': { description: 'Server error' },
        },
      },
      post: {
        tags: ['Listings'],
        summary: 'Create listing (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ListingInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Listing created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Admin required' },
          '500': { description: 'Server error' },
        },
      },
    },
    '/api/listings/{id}': {
      get: {
        tags: ['Listings'],
        summary: 'Get listing by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Single listing',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Listing' },
              },
            },
          },
          '404': { description: 'Listing not found' },
          '500': { description: 'Server error' },
        },
      },
      put: {
        tags: ['Listings'],
        summary: 'Update listing (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ListingInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Listing updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Listing' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Admin required' },
          '404': { description: 'Listing not found' },
          '500': { description: 'Server error' },
        },
      },
      delete: {
        tags: ['Listings'],
        summary: 'Delete listing (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Listing deleted',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean' } } },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Admin required' },
          '404': { description: 'Listing not found' },
          '500': { description: 'Server error' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT from /api/auth/otp/verify',
      },
    },
    schemas: {
      Listing: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          listingType: { type: 'string', enum: ['SALE', 'RENT', 'FLATMATES'] },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
          headline: { type: 'string' },
          description: { type: 'string' },
          location: {
            type: 'object',
            properties: {
              region: { type: 'string' },
              district: { type: 'string' },
              suburb: { type: 'string' },
            },
          },
          propertyType: { type: 'string', enum: ['House', 'Apartment', 'Unit', 'Townhouse', 'Lifestyle', 'Land', 'Other'] },
          price: { type: 'number', nullable: true },
          rentPerWeek: { type: 'number', nullable: true },
          priceNegotiable: { type: 'boolean' },
          bedrooms: { type: 'integer' },
          bathrooms: { type: 'integer' },
          lounges: { type: 'integer' },
          livingRooms: { type: 'integer' },
          parking: { type: 'integer' },
          floorArea: { type: 'number', nullable: true },
          landArea: { type: 'number', nullable: true },
          features: { type: 'array', items: { type: 'string' } },
          images: { type: 'array', items: { type: 'string' } },
          listedDate: { type: 'string', format: 'date-time' },
          updatedDate: { type: 'string', format: 'date-time' },
          createdBy: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
        },
      },
      ListingInput: {
        type: 'object',
        required: ['listingType', 'headline', 'description', 'propertyType', 'region', 'district', 'suburb', 'bedrooms', 'bathrooms', 'parking'],
        properties: {
          listingType: { type: 'string', enum: ['SALE', 'RENT', 'FLATMATES'] },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
          headline: { type: 'string' },
          description: { type: 'string' },
          propertyType: { type: 'string', enum: ['House', 'Apartment', 'Unit', 'Townhouse', 'Lifestyle', 'Land', 'Other'] },
          region: { type: 'string' },
          district: { type: 'string' },
          suburb: { type: 'string' },
          price: { type: 'number', nullable: true },
          rentPerWeek: { type: 'number', nullable: true },
          priceNegotiable: { type: 'boolean' },
          bedrooms: { type: 'integer' },
          bathrooms: { type: 'integer' },
          lounges: { type: 'integer' },
          livingRooms: { type: 'integer' },
          parking: { type: 'integer' },
          floorArea: { type: 'number', nullable: true },
          landArea: { type: 'number', nullable: true },
          features: { type: 'array', items: { type: 'string' } },
          images: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string', nullable: true },
        },
      },
    },
  },
};

/**
 * Swagger "Servers" URL for Try it out:
 * - MUST come from OPENAPI_SERVER_URL env (comma-separated values allowed).
 */
export function getSwaggerDocument(
  req?: Pick<Request, 'headers' | 'protocol' | 'get'>
): typeof swaggerDocument {
  return { ...swaggerDocument, servers: resolveSwaggerServers(req) };
}

function resolveSwaggerServers(
  req?: Pick<Request, 'headers' | 'protocol' | 'get'>
): { url: string; description: string }[] {
  void req;
  const raw = process.env.OPENAPI_SERVER_URL?.trim();
  if (!raw) {
    throw new Error('OPENAPI_SERVER_URL is required when Swagger is enabled.');
  }
  const urls = raw
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  if (urls.length === 0) {
    throw new Error('OPENAPI_SERVER_URL is set but empty.');
  }
  return urls.map((url, idx) => ({
    url,
    description: idx === 0 ? 'Primary (OPENAPI_SERVER_URL)' : `Alternate ${idx + 1}`,
  }));
}
