import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { InvoiceService, Invoice, InvoiceItem } from '../services/invoice.service';
import { ProductService, Product } from '../../products/services/product.service';

@Component({
  selector: 'app-invoice-form',
  template: `
    <div class="invoice-form-container">
      <div class="mat-elevation-z2">
        <div class="mat-headline-5 p-4">{{isEditMode ? 'Edit' : 'Create'}} Invoice</div>

        <div class="p-4">
          <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Client Name</mat-label>
                <input matInput formControlName="clientName" placeholder="Enter client name">
                <mat-error *ngIf="invoiceForm.get('clientName')?.hasError('required')">
                  Client name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="date">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="invoiceForm.get('date')?.hasError('required')">
                  Date is required
                </mat-error>
              </mat-form-field>
            </div>

            <div formArrayName="items">
              <h3>Items</h3>
              <div *ngFor="let item of items.controls; let i=index" [formGroupName]="i" class="item-row">
                <mat-form-field appearance="outline">
                  <mat-label>Product</mat-label>
                  <mat-select formControlName="productId" (selectionChange)="onProductSelect($event.value, i)">
                    <mat-option *ngFor="let product of products" [value]="product.id">
                      {{product.name}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Quantity</mat-label>
                  <input matInput type="number" formControlName="quantity" (input)="updateItemTotal(i)">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Price</mat-label>
                  <input matInput type="number" formControlName="price" (input)="updateItemTotal(i)">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Total</mat-label>
                  <input matInput type="number" [value]="calculateItemTotal(item)" readonly>
                </mat-form-field>

                <button mat-icon-button color="warn" type="button" (click)="removeItem(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <button mat-stroked-button type="button" (click)="addItem()">
                <mat-icon>add</mat-icon>
                Add Item
              </button>
            </div>

            <div class="total-section">
              <h3>Total: {{calculateTotal() | currency}}</h3>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/invoices">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="invoiceForm.invalid">
                {{isEditMode ? 'Update' : 'Create'}} Invoice
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invoice-form-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }

    .item-row {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 16px;
    }

    .mat-form-field {
      flex: 1;
    }

    .total-section {
      text-align: right;
      margin: 20px 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 20px;
    }
  `]
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  isEditMode = false;
  invoiceId?: number;
  products: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.invoiceForm = this.fb.group({
      clientName: ['', Validators.required],
      date: [new Date(), Validators.required],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    
    this.invoiceId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.invoiceId) {
      this.isEditMode = true;
      this.loadInvoice();
    } else {
      this.addItem(); // Add first empty item
    }
  }

  get items() {
    return this.invoiceForm.get('items') as FormArray;
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        console.error('Error loading products:', error);
      }
    });
  }

  loadInvoice(): void {
    if (this.invoiceId) {
      this.invoiceService.getInvoice(this.invoiceId).subscribe({
        next: (invoice) => {
          this.invoiceForm.patchValue({
            clientName: invoice.clientName,
            date: new Date(invoice.date)
          });

          // Clear existing items
          while (this.items.length) {
            this.items.removeAt(0);
          }

          // Add loaded items
          invoice.items.forEach(item => {
            this.items.push(this.createItem(item));
          });
        },
        error: (error) => {
          this.snackBar.open('Error loading invoice', 'Close', { duration: 3000 });
          console.error('Error loading invoice:', error);
        }
      });
    }
  }

  createItem(item?: InvoiceItem): FormGroup {
    return this.fb.group({
      productId: [item?.productId || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      price: [item?.price || 0, [Validators.required, Validators.min(0)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onProductSelect(productId: number, index: number): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      const item = this.items.at(index);
      item.patchValue({
        price: product.price
      });
      this.updateItemTotal(index);
    }
  }

  updateItemTotal(index: number): void {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const price = item.get('price')?.value || 0;
    item.patchValue({ total: quantity * price }, { emitEvent: false });
  }

  calculateItemTotal(item: any): number {
    return (item.get('quantity')?.value || 0) * (item.get('price')?.value || 0);
  }

  calculateTotal(): number {
    return this.items.controls.reduce((total, item) => {
      return total + this.calculateItemTotal(item);
    }, 0);
  }

  onSubmit(): void {
    if (this.invoiceForm.valid) {
      const invoice: Invoice = {
        ...this.invoiceForm.value,
        total: this.calculateTotal(),
        items: this.items.value.map((item: any) => ({
          ...item,
          total: item.quantity * item.price
        }))
      };

      const request = this.isEditMode && this.invoiceId
        ? this.invoiceService.updateInvoice(this.invoiceId, invoice)
        : this.invoiceService.createInvoice(invoice);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            `Invoice ${this.isEditMode ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['/invoices']);
        },
        error: (error) => {
          this.snackBar.open(
            `Error ${this.isEditMode ? 'updating' : 'creating'} invoice`,
            'Close',
            { duration: 3000 }
          );
          console.error('Error saving invoice:', error);
        }
      });
    }
  }
}
