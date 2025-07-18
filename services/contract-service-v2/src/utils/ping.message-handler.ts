import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class PingMessageHandler {
  private readonly logger = new Logger(PingMessageHandler.name);

  constructor(private readonly jwtService: JwtService) {}

  @MessagePattern('ping')
  async ping(@Payload() data: any) {
    this.logger.log(`Ping reçu avec données: ${JSON.stringify(data)}`);
    
    // Vérifier si le token est présent
    const token = data?.token;
    this.logger.log(`Token dans le message: ${token ? 'Présent' : 'Absent'}`);
    
    let tokenInfo = null;
    if (token) {
      try {
        tokenInfo = this.jwtService.decode(token);
        this.logger.log(`Token décodé avec succès: ${JSON.stringify(tokenInfo)}`);
      } catch (error) {
        this.logger.error(`Erreur de décodage du token: ${error.message}`);
      }
    }
    
    return {
      status: 'success',
      data: {
        message: 'Contract Service V2 is alive',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        receivedData: data,
        tokenInfo: tokenInfo
      }
    };
  }
}
