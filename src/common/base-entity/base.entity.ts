import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";

export class BaseColumn {
    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date; 
  
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date; 
  
    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deleted_at: Date | null;
  }