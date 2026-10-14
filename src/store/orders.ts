import { Order } from "@/types";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";

const ORDERS_COLLECTION = "orders";

export async function removeAllOrders(): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured. Please check your .env file.");
  }

  const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
  if (querySnapshot.empty) return;

  const batch = writeBatch(db);
  querySnapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  await batch.commit();
}

export async function loadOrders(): Promise<Order[]> {
  try {
    if (!isFirebaseConfigured) {
      console.warn("Firebase is not configured yet. Returning empty orders list.");
      return [];
    }

    let ordersList: Order[] = [];

    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      ordersList = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: data.id || docSnap.id,
          customerName: data.customer_name || "",
          remark: data.remark || "",
          createdAt: data.created_at || new Date().toISOString(),
          deliveryDate: data.delivery_date || "",
          items: Array.isArray(data.items) ? data.items : [],
          roundOff: Number(data.round_off) || 0,
        };
      });
    } catch (queryErr) {
      // Fallback: in case orderBy requires an index or fails, fetch all and sort in memory
      console.warn("Ordered query failed, falling back to in-memory sort:", queryErr);
      const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
      ordersList = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: data.id || docSnap.id,
            customerName: data.customer_name || "",
            remark: data.remark || "",
            createdAt: data.created_at || new Date().toISOString(),
            deliveryDate: data.delivery_date || "",
            items: Array.isArray(data.items) ? data.items : [],
            roundOff: Number(data.round_off) || 0,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return ordersList;
  } catch (error) {
    console.error("Failed to load orders from Firebase Firestore:", error);
    return [];
  }
}

export async function addOrder(order: Order): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured. Please set your Firebase credentials in .env");
  }

  try {
    const subtotal = order.items.reduce(
      (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0),
      0
    );
    const roundOff = Number(order.roundOff) || 0;
    const total = subtotal + roundOff;

    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(docRef, {
      id: order.id,
      customer_name: order.customerName,
      remark: order.remark || "",
      created_at: order.createdAt || new Date().toISOString(),
      delivery_date: order.deliveryDate || "",
      items: order.items,
      round_off: roundOff,
      total: total,
    });
  } catch (error) {
    console.error("Failed to add order to Firebase Firestore:", error);
    throw error;
  }
}

export async function removeOrder(id: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured. Please check your .env file.");
  }

  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Failed to delete order from Firebase Firestore:", error);
    throw new Error("Failed to delete order");
  }
}