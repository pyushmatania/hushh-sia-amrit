-- Booking triggers
CREATE TRIGGER on_booking_notify
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_booking();

CREATE TRIGGER on_booking_telegram
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_booking();

CREATE TRIGGER on_booking_cancel_telegram
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_booking_cancel();

-- Order trigger
CREATE TRIGGER on_order_telegram
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_order();

-- Revision history triggers
CREATE TRIGGER on_listing_revision
  AFTER INSERT OR UPDATE ON public.host_listings
  FOR EACH ROW EXECUTE FUNCTION public.log_listing_revision();

CREATE TRIGGER on_experience_revision
  AFTER INSERT OR UPDATE ON public.experience_packages
  FOR EACH ROW EXECUTE FUNCTION public.log_experience_revision();

CREATE TRIGGER on_curation_revision
  AFTER INSERT OR UPDATE ON public.curations
  FOR EACH ROW EXECUTE FUNCTION public.log_curation_revision();

-- updated_at auto-update triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.host_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.curations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.experience_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();