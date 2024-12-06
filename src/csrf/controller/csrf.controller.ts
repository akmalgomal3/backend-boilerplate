import { Controller, Get, Req, Request, Response } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('/v1/csrf')
export class CsrfController {
    constructor(){}

    @Get('/token')
    @ApiBearerAuth()
    getCsrfToken(@Req() req): any {
      return {
        data: {
            csrf_token: req.csrfToken()
        }
      }
    }
}
